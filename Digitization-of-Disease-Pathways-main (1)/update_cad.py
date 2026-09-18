from database import SessionLocal, Disease

def update_cad():
    db = SessionLocal()
    try:
        disease = db.query(Disease).filter(Disease.name == 'cad').first()
        if disease:
            disease.name = 'CAD'
            db.commit()
            print("Successfully updated cad to CAD")
        else:
            print("No disease named 'cad' found")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    update_cad()
