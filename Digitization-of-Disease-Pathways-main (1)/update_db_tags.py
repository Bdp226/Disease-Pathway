from database import SessionLocal, PainPoint
import ml_utils

def run_update_and_verify():
    db = SessionLocal()
    pain_points = db.query(PainPoint).all()
    
    updated_count = 0
    print("--- Verification of Real Data ---")
    for pp in pain_points:
        # Re-run ML utils on real data description
        new_urgency = ml_utils.compute_urgency(pp.description)
        new_tags = ml_utils.compute_tags(pp.description)
        
        # Verify the breakdown maps to real words in description
        u_breakdown = ml_utils.compute_urgency_breakdown(pp.description)
        t_breakdown = ml_utils.compute_tags_breakdown(pp.description)
        
        if u_breakdown['score'] != 'low' or t_breakdown:
            print(f"\nID: {pp.id}")
            print(f"Desc: {pp.description[:100]}...")
            print(f"Calculated Urgency: {new_urgency} | Breakdown: {u_breakdown}")
            print(f"Calculated Tags: {new_tags} | Breakdown: {t_breakdown}")
        
        # Update database columns
        if pp.urgency != new_urgency or pp.tags != new_tags:
            pp.urgency = new_urgency
            pp.tags = new_tags
            updated_count += 1
            
    db.commit()
    print(f"\nSuccessfully updated {updated_count} rows in the database to remove old emojis.")
    db.close()

if __name__ == "__main__":
    run_update_and_verify()
