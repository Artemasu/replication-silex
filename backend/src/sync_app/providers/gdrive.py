import os
import io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from .base import StorageProvider

class GoogleDriveProvider(StorageProvider):
    def __init__(self, credentials_path, folder_id=None):
        """
        Initialise le provider Google Drive avec authentification OAuth2 (Navigateur).
        """
        self._provider_name = "Google_Drive"
        self.scopes = ['https://www.googleapis.com/auth/drive']
        
        # Chemins pour OAuth
        self.client_secrets_path = credentials_path
        # On stocke le token.json dans le même dossier que les secrets
        self.token_path = os.path.join(os.path.dirname(credentials_path), 'token.json')

        if not os.path.exists(self.client_secrets_path):
            raise FileNotFoundError(f"Fichier client_secrets.json introuvable : {self.client_secrets_path}")

        # Authentification OAuth2
        self.creds = self._authenticate()
        self.service = build('drive', 'v3', credentials=self.creds)
        
        # Nettoyage de l'ID du dossier
        if folder_id:
            self.folder_id = folder_id.split('?')[0].strip()
        else:
            self.folder_id = "root"

    def _authenticate(self):
        """Gère la récupération ou la création du token d'accès."""
        creds = None
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, self.scopes)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.client_secrets_path, self.scopes)
                creds = flow.run_local_server(port=0)
            
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
        return creds

    @property
    def provider_name(self) -> str:
        return self._provider_name

    def upload(self, file_obj, filename):
        """
        Upload un flux de données file_obj vers Google Drive.
        """
        try:
            # Sécurité : curseur au début
            file_obj.seek(0)
            
            file_metadata = {
                'name': filename,
                'parents': [self.folder_id]
            }

            # Utilisation de MediaIoBaseUpload pour les objets de type flux (BytesIO, file open, etc.)
            media = MediaIoBaseUpload(
                file_obj, 
                mimetype='application/octet-stream', 
                resumable=True
            )
            
            print(f"DEBUG: Envoi de '{filename}' vers GDrive (Folder: {self.folder_id})")

            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id',
                supportsAllDrives=True 
            ).execute()
            
            print(f"✅ [GDrive] Succès ! ID : {file.get('id')}")
            return True

        except Exception as e:
            print(f"❌ [GDrive] ÉCHEC : {str(e)}")
            return False

    def get_status(self):
        return {"status": "active", "provider": self.provider_name}