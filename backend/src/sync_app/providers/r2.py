import boto3
from botocore.exceptions import BotoCoreError, ClientError
from typing import BinaryIO
from .base import StorageProvider

class R2StorageProvider(StorageProvider):

    def __init__(self, bucket_name: str, access_key_id: str, 
                 secret_access_key: str, endpoint_url: str, prefix: str = ""):
        self.bucket_name = bucket_name
        self.prefix = prefix

        self._client = boto3.client(
            "s3",
            region_name="auto",
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            endpoint_url=endpoint_url,
        )

    @property
    def provider_name(self) -> str:
        return "Cloudflare_R2"

    def upload(self, file_object: BinaryIO, filename: str) -> bool:
        s3_key = f"{self.prefix}{filename}" if self.prefix else filename
        try:
            self._client.upload_fileobj(file_object, self.bucket_name, s3_key)
            print(f"[{self.provider_name}] ✅ Upload réussi : {s3_key}")
            return True
        except (BotoCoreError, ClientError) as e:
            print(f"[{self.provider_name}] ❌ Erreur upload : {e}")
            return False

    def get_status(self) -> bool:
        try:
            self._client.head_bucket(Bucket=self.bucket_name)
            return True
        except (BotoCoreError, ClientError):
            return False

    def delete(self, filename: str) -> bool:
        s3_key = f"{self.prefix}{filename}" if self.prefix else filename
        try:
            self._client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            print(f"[{self.provider_name}] ✅ Supprimé : {s3_key}")
            return True
        except (BotoCoreError, ClientError) as e:
            print(f"[{self.provider_name}] ❌ Erreur suppression : {e}")
            return False