from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class DocumentMetadata(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    aws_s3_path = Column(String, nullable=True)
    r2_path = Column(String, nullable=True)      # ← Remplace scaleway_path
    local_path = Column(String, nullable=True) 
    google_drive_path = Column(String, nullable=True)
    
    content_summary = Column(String, nullable=True)