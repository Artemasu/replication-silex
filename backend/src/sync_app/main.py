import io
from pathlib import Path
from typing import List
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

# Imports du projet
from .providers.local import LocalStorageProvider
from .providers.gdrive import GoogleDriveProvider
from .database.session import engine, SessionLocal, get_db
from .database.models import Base, DocumentMetadata
from .core.ai_service import AIService
from dotenv import load_dotenv
import os
import boto3
from botocore.exceptions import NoCredentialsError
from .providers.s3 import S3StorageProvider

# Chargement des variables d'environnement
load_dotenv()

# Gestion des chemins et configurations
# On définit la racine du projet backend/ par rapport à ce fichier
BASE_DIR = Path(__file__).resolve().parent.parent.parent
# On pointe vers le fichier JSON situé dans le dossier backend/
CREDENTIALS_PATH = BASE_DIR / "client_secrets.json"

# Initialisation de la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plateforme de Réplication Documentaire")

# Configuration des destinations de stockage
storage_destinations = [
    LocalStorageProvider(storage_dir="cloud_aws_simulated"),
    LocalStorageProvider(storage_dir="cloud_scaleway_simulated"),
    LocalStorageProvider(storage_dir="Local_storage"),
    S3StorageProvider(
        bucket_name=os.getenv("S3_BUCKET_NAME"),
        region=os.getenv("AWS_REGION"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    ),
    GoogleDriveProvider(
        credentials_path=str(CREDENTIALS_PATH),
        folder_id="1kF2R4pW72NYYVqaoCCqwlUUOUcqAYESc"
    )
]

@app.get("/health")
def health_check():
    # Vérifie que l'API est bien en ligne.
    return {"status": "online", "database": "connected"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint principal pour l'ingestion multi-source.
    Réplique le fichier et extrait le texte pour l'agent IA.
    """
    try:
        # Lecture du fichier en mémoire
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Le fichier est vide")

        # Agent IA : Extraction du texte PDF
        # On passe file_bytes et file.filename
        extracted_text = AIService.extract_text(file_bytes, file.filename)

        # Moteur de Réplication : Logique de "Fan-out" (duplication vers tous les services)
        replication_results = {}
        for provider in storage_destinations:
            # On utilise io.BytesIO pour envoyer une copie du fichier à chaque provider
            success = provider.upload(io.BytesIO(file_bytes), file.filename)
            replication_results[provider.provider_name] = "Success" if success else "Failed"

        # Sauvegarde des métadonnées dans Postgres
        new_doc = DocumentMetadata(
            filename=file.filename,
            aws_s3_path=f"cloud_aws_simulated/{file.filename}",
            scaleway_path=f"cloud_scaleway_simulated/{file.filename}",
            local_path=f"Local_storage/{file.filename}", 
            google_drive_path=f"Google Drive/{file.filename}",
            content_summary=extracted_text
        )

        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        return {
            "document_id": new_doc.id,
            "filename": file.filename,
            "replication_status": replication_results,
            "ai_ocr_status": "Completed" if extracted_text else "No text found",
            "preview": extracted_text[:100] + "..." if extracted_text else ""
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload : {str(e)}")

@app.get("/documents")
def list_documents(db: Session = Depends(get_db)):
    """Liste tous les documents enregistrés."""
    docs = db.query(DocumentMetadata).all()
    return [
        {
            "id": d.id, 
            "filename": d.filename, 
            "date": d.upload_date,
            "has_content": bool(d.content_summary)
        } for d in docs
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)