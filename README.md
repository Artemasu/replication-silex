# Silex — Plateforme de réplication documentaire

Silex permet d'uploader un document et de le répliquer automatiquement vers plusieurs destinations de stockage (Amazon S3, Google Drive, Scaleway simulé, stockage local), tout en extrayant son contenu textuel via un agent IA.

---

## Prérequis

Installer ces outils une seule fois :

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Python 3.13+](https://www.python.org/downloads/)
- [Node.js LTS](https://nodejs.org)

---

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Silex
```

### 2. Créer le fichier `.env`

Créer un fichier `.env` à la racine du projet avec les clés AWS (à demander) :

```env
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_REGION=eu-west-3
S3_BUCKET_NAME=silex-documents
```

### 3. Ajouter `client_secrets.json`

Placer le fichier `client_secrets.json` dans le dossier `backend/`.  
Ce fichier contient les credentials Google Drive (à demander, il n'est pas sur Git)

---

## Lancer le projet

> À chaque session de travail, il faut lancer **3 choses** : Docker, le backend et le frontend.

### Terminal 1 — Base de données

```bash
docker compose up -d
```

### Terminal 2 — Backend

**Première fois uniquement :**
```bash
# Depuis la racine du projet
python -m venv .venv

# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

**À chaque session :**
```bash
# Depuis la racine du projet
.venv\Scripts\activate

cd backend/src
uvicorn sync_app.main:app --reload
```

### Terminal 3 — Frontend

**Première fois uniquement :**
```bash
cd frontend
npm install
```

**À chaque session :**
```bash
cd frontend
npm run dev
```

---

## Accès

| Interface | URL |
|-----------|-----|
| Site | http://localhost:5173 |
| API (Swagger) | http://127.0.0.1:8000/docs |
| Google doc | https://drive.google.com/drive/folders/1kF2R4pW72NYYVqaoCCqwlUUOUcqAYESc |
| AWS S3 | Via les données transmises |

---

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Vérifie que l'API est en ligne |
| POST | `/upload` | Upload et réplique un document |
| GET | `/documents` | Liste tous les documents enregistrés |

---

## Providers de stockage

| Provider | Type | Statut |
|----------|------|--------|
| Amazon S3 | Cloud réel | `eu-west-3` · bucket `silex-documents` |
| Google Drive | Cloud réel | Dossier Silex via OAuth2 |
| Scaleway | Simulé en local | `cloud_scaleway_simulated/` |
| Stockage local | Filesystem | `Local_storage/` |

---

## Structure du projet

```
Silex/
├── backend/
│   ├── src/
│   │   ├── Local_storage/
│   │   └── sync_app/
│   │       ├── core/
│   │       │   ├── ai_service.py       # Service IA (extraction texte)
│   │       │   └── chat_service.py     # Service de chat
│   │       ├── database/
│   │       │   ├── models.py           # Modèles SQLAlchemy
│   │       │   └── session.py          # Session base de données
│   │       ├── providers/
│   │       │   ├── base.py             # Classe de base provider
│   │       │   ├── gdrive.py           # Provider Google Drive
│   │       │   ├── local.py            # Provider Local
│   │       │   ├── r2.py               # Provider Cloudflare R2
│   │       │   └── s3.py               # Provider S3
│   │       └── main.py                 # Point d'entrée FastAPI
│   ├── client_secrets.json             # Ne pas commiter !
│   └── token.json                      # Ne pas commiter !
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.jsx             # Interface chatbot
│   │   │   ├── DocumentList.jsx        # Liste des documents
│   │   │   ├── Providers.jsx           # Statut des providers
│   │   │   └── UploadZone.jsx          # Zone d'upload
│   │   ├── App.jsx                     # Page principale
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── site.py
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── Local_storage/
├── .env                                # Ne pas commiter !
├── .gitignore
├── docker-compose.yml                  # Base de données PostgreSQL
├── requirements.txt                    # Dépendances Python
└── README.md
```
