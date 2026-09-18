from database import SessionLocal, PainPoint
import ml_utils

def reprocess_pain_points():
    db = SessionLocal()
    try:
        pain_points = db.query(PainPoint).all()
        count = 0
        for pp in pain_points:
            pp.urgency = ml_utils.compute_urgency(pp.description)
            pp.tags = ml_utils.compute_tags(pp.description)
            count += 1
            
        db.commit()
        print(f"Successfully reprocessed {count} pain points with ML tags and urgency.")
    finally:
        db.close()

if __name__ == "__main__":
    reprocess_pain_points()
