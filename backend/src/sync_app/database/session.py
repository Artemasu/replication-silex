from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# L'adresse pointe sur localhost car Docker a ouvert le port 5433
DATABASE_URL = "postgresql://user_silex:password_silex@localhost:5433/silex_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()