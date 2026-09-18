import sqlite3
import os

db_path = "disease_pathway.db"

def alter_database():
    print(f"Connecting to {db_path}...")
    if not os.path.exists(db_path):
        print("Database not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE pain_points ADD COLUMN urgency VARCHAR(20) DEFAULT 'low'")
        print("Added 'urgency' column successfully.")
    except sqlite3.OperationalError as e:
        print(f"Column 'urgency' might already exist: {e}")

    try:
        cursor.execute("ALTER TABLE pain_points ADD COLUMN tags VARCHAR(200)")
        print("Added 'tags' column successfully.")
    except sqlite3.OperationalError as e:
        print(f"Column 'tags' might already exist: {e}")
        
    conn.commit()
    conn.close()
    print("Database alteration complete.")

if __name__ == "__main__":
    alter_database()
