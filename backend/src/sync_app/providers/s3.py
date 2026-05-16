import boto3
from .base import StorageProvider

class S3StorageProvider(StorageProvider):
    def __init__(self, bucket_name, aws_access_key, aws_secret_key):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )
        self.bucket_name = bucket_name
        self.provider_name = "AWS_S3"

    def upload(self, file_obj, filename):
        try:
            self.s3.upload_fileobj(file_obj, self.bucket_name, filename)
            return True
        except Exception as e:
            print(f"Erreur S3: {e}")
            return False