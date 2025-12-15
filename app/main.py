from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import SessionLocal, engine
from . import models, schemas, crud

# Crear tablas
models.Base.metadata.create_all(bind=engine)

# Instancia ÚNICA de FastAPI
app = FastAPI(title="Todo API")

# CORS para Netlify
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ruta prueba
@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}

# CRUD TODOS
@app.get("/todos", response_model=list[schemas.Todo])
def read_todos(db: Session = Depends(get_db)):
    return crud.get_todos(db)

@app.post("/todos", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db, todo)

@app.put("/todos/{todo_id}", response_model=schemas.Todo)
def toggle_todo(todo_id: int, db: Session = Depends(get_db)):
    return crud.update_todo(db, todo_id)

@app.delete("/todos/{todo_id}")
def remove_todo(todo_id: int, db: Session = Depends(get_db)):
    crud.delete_todo(db, todo_id)
    return {"message": "Todo eliminado"}
