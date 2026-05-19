import os
import shutil
from pathlib import Path
from .base import StorageProvider
from typing import BinaryIO

class LocalStorageProvider(StorageProvider):
    def __init__(self, storage_dir: str = "local_storage"):
        self.storage_dir = storage_dir
        if not os.path.exists(self.storage_dir):
            os.makedirs(self.storage_dir)

    @property
    def provider_name(self) -> str:
        return "Local_Disk"

    def upload(self, file_object: BinaryIO, filename: str) -> bool:
        try:
            file_path = os.path.join(self.storage_dir, filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file_object, buffer)
            print(f"[OK] Fichier {filename} copié localement.")
            return True
        except Exception as e:
            print(f"[Erreur] Echec stockage local : {e}")
            return False

    def get_status(self) -> bool:
        return os.path.exists(self.storage_dir)
    
    def delete(self, filename: str) -> bool:
        path = Path(self.storage_dir) / filename
        if path.exists():
            path.unlink()
            return True
        return False