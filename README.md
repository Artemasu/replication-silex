# Silex — Plateforme de Réplication Documentaire

Silex est une application permettant d'uploader un document et de le répliquer automatiquement vers plusieurs destinations de stockage (AWS simulé, Scaleway simulé, stockage local, Google Drive), tout en extrayant son contenu textuel via un agent IA.

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé
- Python 3.10+
- Un fichier `client_secrets.json` présent dans le dossier `backend/`

---

## Lancer l'application

### 1. Démarrer Docker Desktop

Lance Docker Desktop et assure-toi qu'il est bien en cours d'exécution.

### 2. Se placer dans le bon dossier

```bash
cd backend/src
```

### 3. Créer et activer un environnement virtuel

```bash
python -m venv venv
venv\Scripts\activate
```

### 4. Installer les dépendances

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart google-api-python-client psycopg2
```

### 5. Lancer le serveur

```bash
uvicorn sync_app.main:app --reload
```

### 6. Accéder à la documentation interactive

Ouvre dans ton navigateur :

```
http://127.0.0.1:8000/docs
```

---

## Vérifier la réplication

Après un upload, tu peux vérifier que le fichier a bien été répliqué :

- **En local** : dossiers `cloud_aws_simulated/`, `cloud_scaleway_simulated/`, `Local_storage/` dans `backend/src/`
- **Sur Google Drive** : [Dossier Drive du projet](https://drive.google.com/drive/folders/1kF2R4pW72NYYVqaoCCqwlUUOUcqAYESc?usp=drive_link)

---

## Endpoints principaux

| Méthode | Route        | Description                          |
|---------|--------------|--------------------------------------|
| GET     | `/health`    | Vérifie que l'API est en ligne       |
| POST    | `/upload`    | Upload et réplique un document       |
| GET     | `/documents` | Liste tous les documents enregistrés |