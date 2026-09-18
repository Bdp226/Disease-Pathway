from database import SessionLocal, Disease

def delete_diseases():
    db = SessionLocal()
    try:
        for name in ["lung cancer staging", "alzheimer_s"]:
            disease = db.query(Disease).filter(Disease.name == name).first()
            if disease:
                db.delete(disease)
                print(f"Deleted {name}")
            else:
                print(f"{name} not found")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    delete_diseases()
