import os
import json
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import hashlib
import secrets
import jwt

# ----------------- Configuration -----------------
SECRET_KEY = os.environ.get("SECRET_KEY", "house_hub_super_secret_roommates_key_2026")
ALGORITHM = "HS256"
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./house.db")

# Fix for Render / Heroku postgres:// URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def hash_pin(pin: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_pin(pin: str, stored_hash: str) -> bool:
    if not stored_hash or ":" not in stored_hash:
        return False
    salt, key_hex = stored_hash.split(":", 1)
    new_key = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt.encode("utf-8"), 100000)
    return secrets.compare_digest(new_key.hex(), key_hex)

# ----------------- Database Models -----------------
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    pin_hash = Column(String)

class ExpenseModel(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    date = Column(String)
    paid_by = Column(String)
    total = Column(Float)
    items_json = Column(Text)   # JSON string of items list
    splits_json = Column(Text)  # JSON string of splits list
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskModel(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, index=True)
    date = Column(String)
    type = Column(String)
    custom_type = Column(String, nullable=True)
    assigned_to = Column(String)
    time = Column(String, nullable=True)
    note = Column(String, nullable=True)
    repeat = Column(String, default="none")
    completed = Column(Boolean, default=False)

class ShoppingModel(Base):
    __tablename__ = "shopping"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    added_by = Column(String)
    date = Column(String)
    purchased = Column(Boolean, default=False)

class NoteModel(Base):
    __tablename__ = "notes"
    id = Column(String, primary_key=True, index=True)
    content = Column(Text)
    category = Column(String)
    author = Column(String)
    time = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ----------------- Seed Default Data -----------------
ROOMMATES = ["Vaishali", "Kaviya", "Elakiya", "Swathi"]

def load_demo_data(db: Session):
    db.query(ExpenseModel).delete()
    db.query(TaskModel).delete()
    db.query(ShoppingModel).delete()
    db.query(NoteModel).delete()

    today_str = datetime.now().strftime("%Y-%m-%d")
    yesterday_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    sample_splits_1 = [
        {"user": "Vaishali", "shareAmount": 267.50, "paid": False},
        {"user": "Kaviya", "shareAmount": 267.50, "paid": True},
        {"user": "Elakiya", "shareAmount": 267.50, "paid": False},
        {"user": "Swathi", "shareAmount": 267.50, "paid": True}
    ]
    sample_items_1 = [
        {"name": "Rice (5kg bag)", "amount": 800.0},
        {"name": "Fresh Vegetables", "amount": 250.0},
        {"name": "Curry leaves & coriander", "amount": 20.0}
    ]
    db.add(ExpenseModel(
        id="exp-1",
        title="Supermarket Grocery Run",
        date=today_str,
        paid_by="Swathi",
        total=1070.0,
        items_json=json.dumps(sample_items_1),
        splits_json=json.dumps(sample_splits_1)
    ))

    sample_splits_2 = [
        {"user": "Vaishali", "shareAmount": 15.00, "paid": True},
        {"user": "Kaviya", "shareAmount": 15.00, "paid": True},
        {"user": "Elakiya", "shareAmount": 15.00, "paid": True},
        {"user": "Swathi", "shareAmount": 15.00, "paid": False}
    ]
    sample_items_2 = [
        {"name": "Arokya Milk (2 packets)", "amount": 60.0}
    ]
    db.add(ExpenseModel(
        id="exp-2",
        title="Morning Dairy Supply",
        date=yesterday_str,
        paid_by="Kaviya",
        total=60.0,
        items_json=json.dumps(sample_items_2),
        splits_json=json.dumps(sample_splits_2)
    ))

    sample_splits_3 = [
        {"user": "Vaishali", "shareAmount": 62.50, "paid": True},
        {"user": "Kaviya", "shareAmount": 62.50, "paid": False},
        {"user": "Elakiya", "shareAmount": 62.50, "paid": False},
        {"user": "Swathi", "shareAmount": 62.50, "paid": False}
    ]
    sample_items_3 = [
        {"name": "Floor cleaner & Harpic", "amount": 150.0},
        {"name": "Dishwash bar & sponge", "amount": 100.0}
    ]
    db.add(ExpenseModel(
        id="exp-3",
        title="House Cleaning & Toiletries",
        date=yesterday_str,
        paid_by="Vaishali",
        total=250.0,
        items_json=json.dumps(sample_items_3),
        splits_json=json.dumps(sample_splits_3)
    ))

    db.add(TaskModel(id="task-1", date=today_str, type="🍳 Cooking", assigned_to="Swathi", time="Morning & Lunch", note="Sambar, Potato fry & Rice", repeat="daily", completed=False))
    db.add(TaskModel(id="task-2", date=today_str, type="🍽 Washing vessels", assigned_to="Kaviya", time="After meals", note="", repeat="daily", completed=True))
    db.add(TaskModel(id="task-3", date=today_str, type="🧹 Sweeping", assigned_to="Vaishali", time="Evening", note="Living room & bedrooms", repeat="none", completed=False))
    db.add(TaskModel(id="task-4", date=today_str, type="🗑 Taking garbage out", assigned_to="Elakiya", time="Night 9:00 PM", note="Wet & dry waste", repeat="daily", completed=False))
    db.add(TaskModel(id="task-5", date=tomorrow_str, type="🍳 Cooking", assigned_to="Kaviya", time="Dinner", note="Chapatis and Dal", repeat="none", completed=False))
    db.add(TaskModel(id="task-6", date=tomorrow_str, type="🚿 Bathroom cleaning", assigned_to="Elakiya", time="Morning", note="Common bathroom", repeat="weekly", completed=False))

    db.add(ShoppingModel(id="shop-1", name="Milk (1 Litre)", added_by="Kaviya", date=today_str, purchased=False))
    db.add(ShoppingModel(id="shop-2", name="Surf Excel Detergent", added_by="Vaishali", date=today_str, purchased=False))
    db.add(ShoppingModel(id="shop-3", name="Colgate Toothpaste", added_by="Swathi", date=yesterday_str, purchased=True))
    db.add(ShoppingModel(id="shop-4", name="Bathing Soaps (Dettol/Dove)", added_by="Elakiya", date=today_str, purchased=False))
    db.add(ShoppingModel(id="shop-5", name="Garbage bags roll", added_by="Swathi", date=today_str, purchased=False))

    db.add(NoteModel(id="note-1", content="Electricity bill needs to be paid before 10th. Total is around ₹1,400.", category="⚡ Bills & Utilities", author="Vaishali", time="Today, 10:15 AM"))
    db.add(NoteModel(id="note-2", content="Gas cylinder is almost empty, please use the small burner carefully. I will book a refill today.", category="📌 General", author="Swathi", time="Yesterday, 8:40 PM"))
    db.add(NoteModel(id="note-3", content="My college friend Ananya is visiting tomorrow evening for 2 hours.", category="🎉 Event / Friends coming", author="Kaviya", time="Yesterday, 6:00 PM"))
    db.commit()

def seed_database():
    db = SessionLocal()
    try:
        # Ensure the 4 roommate accounts exist with default PIN (1234) if not already present
        for name in ROOMMATES:
            existing = db.query(UserModel).filter(UserModel.name == name).first()
            if not existing:
                db.add(UserModel(name=name, pin_hash=hash_pin("1234")))
        db.commit()
    finally:
        db.close()

seed_database()

# ----------------- Dependency -----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username not in ROOMMATES:
            raise HTTPException(status_code=401, detail="Invalid user")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ----------------- FastAPI App -----------------
app = FastAPI(title="House Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Schemas -----------------
class LoginRequest(BaseModel):
    username: str
    pin: str

class ChangePinRequest(BaseModel):
    current_pin: Optional[str] = None
    new_pin: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class ExpenseCreate(BaseModel):
    id: Optional[str] = None
    title: str
    date: str
    paidBy: str
    total: float
    items: list
    splitUsers: list
    splits: list

class TaskCreate(BaseModel):
    id: Optional[str] = None
    date: str
    type: str
    customType: Optional[str] = None
    assignedTo: str
    time: Optional[str] = None
    note: Optional[str] = None
    repeat: Optional[str] = "none"
    completed: Optional[bool] = False

class ShoppingCreate(BaseModel):
    name: str

class NoteCreate(BaseModel):
    id: Optional[str] = None
    content: str
    category: str

# ----------------- Auth Endpoints -----------------
@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if req.username not in ROOMMATES:
        raise HTTPException(status_code=400, detail="User not recognized")
    
    user = db.query(UserModel).filter(UserModel.name == req.username).first()
    if not user or not verify_pin(req.pin, user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect PIN or password")

    token = jwt.encode(
        {"sub": req.username, "exp": datetime.utcnow() + timedelta(days=90)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"token": token, "username": req.username}

@app.post("/api/auth/change-password")
@app.post("/api/auth/change-pin")
def change_pin(req: ChangePinRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    curr = req.current_pin or req.current_password or ""
    new = req.new_pin or req.new_password or ""

    if not curr:
        raise HTTPException(status_code=400, detail="Current password/PIN is required")
    if not new or len(new) < 4:
        raise HTTPException(status_code=400, detail="New password/PIN must be at least 4 characters")

    user = db.query(UserModel).filter(UserModel.name == current_user).first()
    if not user or not verify_pin(curr, user.pin_hash):
        raise HTTPException(status_code=400, detail="Current password/PIN is incorrect")
    
    user.pin_hash = hash_pin(new)
    db.commit()
    return {"message": "Password updated successfully"}

@app.get("/api/auth/me")
def get_me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}

# ----------------- Synchronized Data Endpoint -----------------
@app.get("/api/data")
def get_all_data(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    expenses = db.query(ExpenseModel).order_by(ExpenseModel.date.desc()).all()
    tasks = db.query(TaskModel).order_by(TaskModel.date.asc()).all()
    shopping = db.query(ShoppingModel).all()
    notes = db.query(NoteModel).order_by(NoteModel.created_at.desc()).all()

    return {
        "activeUser": current_user,
        "expenses": [
            {
                "id": e.id,
                "title": e.title,
                "date": e.date,
                "paidBy": e.paid_by,
                "total": e.total,
                "items": json.loads(e.items_json),
                "splits": json.loads(e.splits_json)
            }
            for e in expenses
        ],
        "tasks": [
            {
                "id": t.id,
                "date": t.date,
                "type": t.type,
                "customType": t.custom_type,
                "assignedTo": t.assigned_to,
                "time": t.time,
                "note": t.note,
                "repeat": t.repeat,
                "completed": t.completed
            }
            for t in tasks
        ],
        "shopping": [
            {
                "id": s.id,
                "name": s.name,
                "addedBy": s.added_by,
                "date": s.date,
                "purchased": s.purchased
            }
            for s in shopping
        ],
        "notes": [
            {
                "id": n.id,
                "content": n.content,
                "category": n.category,
                "author": n.author,
                "time": n.time
            }
            for n in notes
        ]
    }

# ----------------- Expenses CRUD -----------------
@app.post("/api/expenses")
def save_expense(exp: ExpenseCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    exp_id = exp.id or f"exp-{int(datetime.utcnow().timestamp()*1000)}"
    existing = db.query(ExpenseModel).filter(ExpenseModel.id == exp_id).first()

    if existing:
        # Strict Rule: Only the payer can edit!
        if existing.paid_by != current_user:
            raise HTTPException(status_code=403, detail=f"Only {existing.paid_by} can edit this expense.")
        existing.title = exp.title
        existing.date = exp.date
        existing.total = exp.total
        existing.items_json = json.dumps(exp.items)
        existing.splits_json = json.dumps(exp.splits)
    else:
        # Strict Rule: Paid by is always the authenticated user creating the expense
        new_exp = ExpenseModel(
            id=exp_id,
            title=exp.title,
            date=exp.date,
            paid_by=current_user,
            total=exp.total,
            items_json=json.dumps(exp.items),
            splits_json=json.dumps(exp.splits)
        )
        db.add(new_exp)
    
    db.commit()
    return {"id": exp_id, "message": "Expense saved"}

@app.delete("/api/expenses/{exp_id}")
def delete_expense(exp_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == exp_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Strict Rule: Only the payer can delete!
    if expense.paid_by != current_user:
        raise HTTPException(status_code=403, detail=f"Only {expense.paid_by} can delete this expense.")
    
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}

@app.patch("/api/expenses/{exp_id}/toggle-my-split")
@app.patch("/api/expenses/{exp_id}/splits/{username}/toggle")
def toggle_split_paid(exp_id: str, username: Optional[str] = None, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Security Rule: The server identifies the user strictly from the authenticated JWT session.
    # It only modifies current_user's share, never trusting an arbitrary username from the frontend.
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == exp_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    splits = json.loads(expense.splits_json)
    found = False
    for s in splits:
        if s["user"] == current_user:
            found = True
            s["paid"] = not s.get("paid", False)
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="You are not part of this expense split")
            
    expense.splits_json = json.dumps(splits)
    db.commit()
    return {"message": "Split updated", "splits": splits}

# ----------------- Tasks CRUD -----------------
@app.post("/api/tasks")
def save_task(task: TaskCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    task_id = task.id or f"task-{int(datetime.utcnow().timestamp()*1000)}"
    existing = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    
    if existing:
        existing.date = task.date
        existing.type = task.type
        existing.custom_type = task.customType
        existing.assigned_to = task.assignedTo
        existing.time = task.time
        existing.note = task.note
        existing.repeat = task.repeat
    else:
        new_task = TaskModel(
            id=task_id,
            date=task.date,
            type=task.type,
            custom_type=task.customType,
            assigned_to=task.assignedTo,
            time=task.time,
            note=task.note,
            repeat=task.repeat,
            completed=False
        )
        db.add(new_task)
    
    db.commit()
    return {"id": task_id, "message": "Task saved"}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if task:
        db.delete(task)
        db.commit()
    return {"message": "Task deleted"}

@app.patch("/api/tasks/{task_id}/toggle")
def toggle_task(task_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if task:
        task.completed = not task.completed
        db.commit()
        return {"completed": task.completed}
    raise HTTPException(status_code=404, detail="Task not found")

# ----------------- Shopping CRUD -----------------
@app.post("/api/shopping")
def add_shopping_item(item: ShoppingCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    item_id = f"shop-{int(datetime.utcnow().timestamp()*1000)}"
    new_item = ShoppingModel(
        id=item_id,
        name=item.name,
        added_by=current_user,
        date=datetime.now().strftime("%Y-%m-%d"),
        purchased=False
    )
    db.add(new_item)
    db.commit()
    return {"id": item_id, "name": item.name}

@app.patch("/api/shopping/{item_id}/toggle")
def toggle_shopping(item_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ShoppingModel).filter(ShoppingModel.id == item_id).first()
    if item:
        item.purchased = not item.purchased
        db.commit()
        return {"purchased": item.purchased}
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/api/shopping/{item_id}")
def delete_shopping_item(item_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ShoppingModel).filter(ShoppingModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Shopping item deleted"}

@app.post("/api/shopping/clear-completed")
def clear_completed_shopping(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(ShoppingModel).filter(ShoppingModel.purchased == True).delete()
    db.commit()
    return {"message": "Cleared completed items"}

# ----------------- Notes CRUD -----------------
@app.post("/api/notes")
def save_note(note: NoteCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now()
    time_str = now.strftime("%d %b, %I:%M %p")
    note_id = note.id or f"note-{int(datetime.utcnow().timestamp()*1000)}"
    existing = db.query(NoteModel).filter(NoteModel.id == note_id).first()

    if existing:
        if existing.author != current_user:
            raise HTTPException(status_code=403, detail=f"Only {existing.author} can edit this note.")
        existing.content = note.content
        existing.category = note.category
    else:
        new_note = NoteModel(
            id=note_id,
            content=note.content,
            category=note.category,
            author=current_user,
            time=time_str
        )
        db.add(new_note)

    db.commit()
    return {"id": note_id, "message": "Note saved"}

@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
    if note:
        if note.author != current_user:
            raise HTTPException(status_code=403, detail=f"Only {note.author} can delete this note.")
        db.delete(note)
        db.commit()
    return {"message": "Note deleted"}

# ----------------- Shared Household Data Reset -----------------
@app.post("/api/reset/blank")
def reset_to_blank(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Clear all shared household data from database while keeping user accounts
    db.query(ExpenseModel).delete()
    db.query(TaskModel).delete()
    db.query(ShoppingModel).delete()
    db.query(NoteModel).delete()
    db.commit()
    return {"message": "All shared household data cleared from database"}

@app.post("/api/reset/demo")
def reset_to_demo(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Clear existing shared data and reload sample demo data
    load_demo_data(db)
    return {"message": "Sample demo data reloaded into database"}

# ----------------- Static Files -----------------
# Serves index.html, style.css, app.js directly from current folder
app.mount("/", StaticFiles(directory=".", html=True), name="static")
