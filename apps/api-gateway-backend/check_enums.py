import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_db"
)
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("SELECT typname FROM pg_type WHERE typname LIKE '%iep%'"))
    print("IEP-related enum types:")
    for row in result:
        print(f"  - {row[0]}")

    result = conn.execute(
        text("SELECT table_name FROM information_schema.tables WHERE table_name = 'ieps'")
    )
    if result.fetchone():
        print("\nieps table EXISTS")
    else:
        print("\nieps table DOES NOT EXIST")
