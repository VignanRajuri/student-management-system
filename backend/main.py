from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import os

# --- 1. CONFIGURATION & DATABASE SETUP ---
# Fetch DATABASE_URL from environment variables (Supabase/Render)
# Fallback to local SQLite ONLY for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")

# PostgreSQL fix: Render/Supabase use 'postgresql://', but SQLAlchemy 
# sometimes requires 'postgresql+psycopg2://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# --- 2. APP SETUP ---
app = FastAPI()

# --- 3. CORS SETUP (Corrected) ---
# This allows your specific Vercel URL and local testing
# --- 3. CORS SETUP ---
origins = [
    "http://localhost:5173",
    "https://student-management-system-git-main-vignanrajuris-projects.vercel.app",
    "https://student-management-system-vignanrajuris-projects.vercel.app",
]

# TEMPORARY TEST ONLY (NOT RECOMMENDED FOR LONG TERM)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This allows EVERY website to talk to your backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- 4. DATA MODEL ---
class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    age: int
    major: str
    email: str

# --- 5. CRUD ENDPOINTS ---

@app.post("/students/", response_model=Student)
def create_student(student: Student, session: Session = Depends(get_session)):
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.get("/students/", response_model=List[Student])
def read_students(session: Session = Depends(get_session)):
    students = session.exec(select(Student)).all()
    return students

@app.get("/students/{student_id}", response_model=Student)
def read_student(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.put("/students/{student_id}", response_model=Student)
def update_student(student_id: int, student_data: Student, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update fields
    for key, value in student_data.dict(exclude_unset=True).items():
        if key != "id":
            setattr(student, key, value)
    
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.delete("/students/{student_id}")
def delete_student(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    session.delete(student)
    session.commit()
    return {"message": "Student deleted successfully"}