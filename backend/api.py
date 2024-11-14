from typing import List, Optional
from fastapi import FastAPI, Path, HTTPException, Depends
from pydantic import BaseModel,EmailStr
from sqlalchemy import create_engine, Column, String, Float,  ForeignKey, Integer, DateTime,func,ForeignKeyConstraint
from sqlalchemy.orm import Session, declarative_base
from uuid import UUID  # Import UUID type
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from fastapi_cors import CORS
from fastapi.middleware.cors import CORSMiddleware 
from datetime import datetime

app = FastAPI()
CORS(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],  # Specify your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base = declarative_base()

# Pydantic model for response
class BookResponse(BaseModel):
    book_id: UUID
    isbn13: str | None
    isbn10: str | None
    title: str
    subtitle: str | None
    authors: str | None
    categories: str | None
    thumbnail: str | None
    description: str | None
    published_year: int | None
    average_rating: float | None
    num_pages: int | None
    ratings_count: int | None

    class Config:
        from_attributes = True

# SQLAlchemy model
class Book(Base):
    __tablename__ = "books"

    book_id = Column(String, primary_key=True)
    isbn13 = Column(String, nullable=True)
    isbn10 = Column(String, nullable=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    authors = Column(String, nullable=True)
    categories = Column(String, nullable=True)
    thumbnail = Column(String, nullable=True)
    description = Column(String, nullable=True)
    published_year = Column(Integer, nullable=True)
    average_rating = Column(Float, nullable=True)
    num_pages = Column(Integer, nullable=True)
    ratings_count = Column(Integer, nullable=True)

# Create database engine
engine = create_engine("postgresql://neondb_owner:8ojEy7YLPIqC@ep-divine-snowflake-a1f3wioc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
Base.metadata.create_all(engine)

# Create database session
def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

@app.get("/api/books", response_model=List[BookResponse])
def get_all_books(db: Session = Depends(get_db)):
    """
    Retrieve a list of all books.
    """
    books = db.query(Book).order_by(func.random()).limit(1600).all()  
    
    if not books:
        raise HTTPException(status_code=404, detail="No books found")

    return books  # FastAPI will convert this to JSON using the response_model

@app.get("/api/books/{book_id}", response_model=BookResponse)
def get_book_by_id(book_id: str = Path(..., title="Book ID"), db: Session = Depends(get_db)):
    """
    Retrieve a book by its ID.
    """
    book = db.query(Book).filter(Book.book_id == book_id).first()  # Use .first() instead of .all()
    
    # Log the result to check if data is being fetched
    print(f"Fetched book by ID {book_id}: {book}")
    
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return book

@app.get("/api/books/category/{category}", response_model=List[BookResponse])
def get_books_by_category(category: str, db: Session = Depends(get_db)):
    """
    Retrieve a list of books by category.
    """
    books = db.query(Book).filter(Book.categories.like(f"%{category}%")).all()
    
    # Log the result to check if data is being fetched
    print(f"Fetched books by category {category}: {books}")
    
    return books

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SQLAlchemy model for User
class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, server_default=func.gen_random_uuid())
    firstname = Column(String(50), nullable=False)
    lastname = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    number_books_borrowed = Column(Integer, default=0)

# Pydantic models for validation
class UserCreate(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: UUID
    firstname: str
    lastname: str
    email: str
    number_books_borrowed: int

    class Config:
        from_attributes = True


# Helper function to hash passwords
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Helper function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/api/signup", response_model=UserResponse)
def sign_up(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before storing
    hashed_password = hash_password(user.password)

    # Create and store the new user
    new_user = User(
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db.refresh(new_user)
    
    return new_user

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if db_user is None:
         raise HTTPException(status_code=401, detail="Email Not found")
    elif not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        return {"message": "Login successful", "user_id": db_user.user_id}
    
# Route to get a user by ID
class UserByIdRequest(BaseModel):
    user_id: UUID
    
@app.post("/api/get_user_byid", response_model=UserResponse)
def get_user_by_id(user_request: UserByIdRequest, db: Session = Depends(get_db)):
    """
    Retrieve a user by their user_id, provided in the request body.
    """
    user = db.query(User).filter(User.user_id == user_request.user_id).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None
    
@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """
    Update user profile information
    """
    # Get the existing user
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password if provided
    if user_update.current_password and user_update.new_password:
        if not verify_password(user_update.current_password, db_user.password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        db_user.password = hash_password(user_update.new_password)
    
    # Update other fields if provided
    if user_update.firstname:
        db_user.firstname = user_update.firstname
    if user_update.lastname:
        db_user.lastname = user_update.lastname
    if user_update.email:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.user_id != user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = user_update.email
    
    try:
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Update failed")
    
    return db_user