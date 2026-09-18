import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Disease, Base

engine = create_engine("sqlite:///./disease_pathway.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Delete old manual entries
for old_id in [1, 2, 4]:
    d = db.query(Disease).filter(Disease.id == old_id).first()
    if d:
        db.delete(d)

db.commit() # Commit the deletion first

# Rename new entries to have clean names
d5 = db.query(Disease).filter(Disease.id == 5).first()
if d5: d5.name = "Alzheimer's"

d6 = db.query(Disease).filter(Disease.id == 6).first()
if d6: d6.name = "CAD"

d7 = db.query(Disease).filter(Disease.id == 7).first()
if d7: d7.name = "Lung Cancer Staging"

db.commit()
print("Cleanup complete.")
