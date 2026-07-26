import json
import sys
from sqlalchemy.orm import Session
from auth.database import create_auth_tables, AuthSessionLocal, Admin
from auth.utils import get_password_hash

def load_admin_config():
    """Load admin configuration from JSON file"""
    try:
        with open('admins.json', 'r') as f:
            config = json.load(f)
        return config.get('admins', [])
    except FileNotFoundError:
        print("Error: admins.json not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: Invalid JSON in admins.json")
        sys.exit(1)

def create_admins():
    """Create admin users from JSON configuration"""
    create_auth_tables()
    
    admin_list = load_admin_config()
    if not admin_list:
        print("No admins found in configuration")
        return
    
    db = AuthSessionLocal()
    created_count = 0
    skipped_count = 0
    
    try:
        for admin_data in admin_list:
            email = admin_data.get('email')
            full_name = admin_data.get('full_name')
            password = admin_data.get('password')
            
            if not all([email, full_name, password]):
                print(f"Skipping invalid admin entry: {admin_data}")
                continue
            
            existing_admin = db.query(Admin).filter(Admin.email == email).first()
            if existing_admin:
                print(f"Admin already exists: {email}")
                skipped_count += 1
                continue
            
            password_hash = get_password_hash(password)
            new_admin = Admin(
                email=email,
                full_name=full_name,
                password_hash=password_hash
            )
            
            db.add(new_admin)
            db.commit()
            print(f"Created admin: {email}")
            created_count += 1
            
    except Exception as e:
        print(f"Error creating admins: {e}")
        db.rollback()
    finally:
        db.close()
    
    print(f"Summary: {created_count} admins created, {skipped_count} skipped")

if __name__ == "__main__":
    create_admins()
