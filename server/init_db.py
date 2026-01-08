from database.database import engine, Base
from database import models

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database initialized successfully!")
