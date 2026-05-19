import io
from pathlib import Path
from typing import List
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
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
from .providers.r2 import R2StorageProvider
from .core.chat_service import ChatService

# Chargement des variables d'environnement
load_dotenv()
chat_service = ChatService()

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
    ),
    R2StorageProvider(
        bucket_name=os.getenv("R2_BUCKET_NAME"),
        access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        endpoint_url=os.getenv("R2_ENDPOINT_URL"),
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
            r2_path=f"silex-r2/{file.filename}",          # ← Remplace scaleway_path
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

@app.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(DocumentMetadata).filter(DocumentMetadata.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")
    
    for provider in storage_destinations:
        provider.delete(doc.filename)
    
    db.delete(doc)
    db.commit()
    return {"message": f"{doc.filename} supprimé"}

@app.delete("/documents")
async def delete_all_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentMetadata).all()
    for doc in docs:
        for provider in storage_destinations:
            provider.delete(doc.filename)
    db.query(DocumentMetadata).delete()
    db.commit()
    return {"message": "Tous les documents supprimés"}

@app.post("/chat")
async def chat(question: str, db: Session = Depends(get_db)):
    docs = db.query(DocumentMetadata).all()
    answer = chat_service.ask(question, docs)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)