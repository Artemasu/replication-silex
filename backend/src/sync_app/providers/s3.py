import boto3
from botocore.exceptions import BotoCoreError, ClientError
from typing import BinaryIO

from .base import StorageProvider


class S3StorageProvider(StorageProvider):
    """
    Provider de stockage pour Amazon S3.
    Hérite de StorageProvider et implémente l'interface upload/get_status.
    """

    def __init__(self, bucket_name: str, region: str, aws_access_key_id: str, aws_secret_access_key: str, prefix: str = ""):
        """
        :param bucket_name:           Nom du bucket S3.
        :param region:                Région AWS (ex: 'eu-west-3').
        :param aws_access_key_id:     Clé d'accès AWS.
        :param aws_secret_access_key: Clé secrète AWS.
        :param prefix:                Dossier cible dans le bucket (optionnel, ex: 'uploads/').
        """
        self.bucket_name = bucket_name
        self.prefix = prefix

        self._client = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )

    @property
    def provider_name(self) -> str:
        return "AWS_S3"

    def upload(self, file_object: BinaryIO, filename: str) -> bool:
        """
        Upload un fichier vers S3.
        :param file_object: Contenu du fichier en binaire (BytesIO).
        :param filename:    Nom du fichier à enregistrer.
        :return: True si succès, False sinon.
        """
        s3_key = f"{self.prefix}{filename}" if self.prefix else filename
        try:
            self._client.upload_fileobj(file_object, self.bucket_name, s3_key)
            print(f"[{self.provider_name}] ✅ Upload réussi : s3://{self.bucket_name}/{s3_key}")
            return True
        except (BotoCoreError, ClientError) as e:
            print(f"[{self.provider_name}] ❌ Erreur upload : {e}")
            return False

    def get_status(self) -> bool:
        """
        Vérifie que le bucket S3 est accessible.
        :return: True si accessible, False sinon.
        """
        try:
            self._client.head_bucket(Bucket=self.bucket_name)
            return True
        except (BotoCoreError, ClientError):
            return False