import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Disease, Base

engine = create_engine("sqlite:///./disease_pathway.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

diseases = db.query(Disease).all()
for d in diseases:
    print(f"ID: {d.id} | Name: {d.name} | Group: {d.group} | Created: {d.created_at}")
