from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class DocumentMetadata(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # On stocke ici l'état de réplication pour chaque service 
    aws_s3_path = Column(String, nullable=True)
    scaleway_path = Column(String, nullable=True)
    local_path = Column(String, nullable=True) 
    google_drive_path = Column(String, nullable=True)
    
    # Pour l'Agent IA plus tard, on peut stocker un résumé du contenu extrait pour faciliter les recherches
    content_summary = Column(String, nullable=True)