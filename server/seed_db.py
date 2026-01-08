from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from database import models

def seed_data():
    db = SessionLocal()
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.email == "demo@dispatch.ai").first()
    if not user:
        print("Creating demo user...")
        new_user = models.User(
            username="dispatcher_01",
            email="demo@dispatch.ai",
            full_name="Officer Murtaza",
            hashed_password="hashed_secret_password", # TODO: Implement real hashing later
            role="Senior Dispatcher"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create Settings for this user
        settings = models.UserSettings(
            user_id=new_user.id,
            theme="dark",
            default_state="TX"
        )
        db.add(settings)
        db.commit()
        print("User created successfully.")
    else:
        print("User already exists.")
    
    db.close()

if __name__ == "__main__":
    seed_data()
