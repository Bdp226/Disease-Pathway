from database import get_db, DatabaseOperations, engine, SessionLocal
from cache_manager import cache

def test():
    db = SessionLocal()
    try:
        db_ops = DatabaseOperations(db)
        pathway_data = db_ops.get_disease_pathway_data('cad')
        print("Data fetched successfully!")
        print("Stages:", len(pathway_data.get('stages', {})))
    except Exception as e:
        print("Error fetching data:", e)
    finally:
        db.close()

if __name__ == "__main__":
    test()
