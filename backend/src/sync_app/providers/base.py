from abc import ABC, abstractmethod
from typing import BinaryIO

class StorageProvider(ABC):

# Interface de base pour tous les services de stockage. 
# Chaque nouveau provider (S3, Scaleway et local) doit hériter de cette classe.

    @abstractmethod
    def upload(self, file_object: BinaryIO, filename: str) -> bool:
        """
        Upload un fichier vers le service de stockage.
        :param file_object: Le contenu du fichier en binaire.
        :param filename: Le nom du fichier à enregistrer.
        :return: True si l'upload a réussi, sinon False.
        """
        pass

    @abstractmethod
    def get_status(self) -> bool:
        """
        Vérifie si le service est en ligne et accessible.
        """
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """
        Retourne le nom du provider ('AWS_S3', 'Scaleway' ou 'Local').
        """
        pass