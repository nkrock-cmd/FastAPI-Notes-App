from fastapi import APIRouter
from fastapi import Request,HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import Union
from pymongo import MongoClient
from bson import ObjectId, errors
from schemas.note import noteEntity,notesEntity


note = APIRouter()


templates = Jinja2Templates(directory="templates")

conn = "mongodb+srv://nkrock:nkrock123@project-cluster.76hex.mongodb.net"
client = MongoClient(conn)
db = client.notes  # Database
collection = db.notes  # Collection

@note.get("/",response_class=HTMLResponse)
async def read_root(request: Request):
    
    result = client.notes.notes.find({})
    newDocs =[]
    for doc in result:
        newDocs.append({
            "id": doc["_id"],  # Uncomment if needed
            "title": doc.get("title", "No Title"),  # Default value if missing
            "desc": doc.get("desc", "No Description"),  # Default value if missing
            "important": doc.get("important", False)  # Default False if missing
        })

    return templates.TemplateResponse("index.html", {"request":request, "newDocs":newDocs})


@note.post("/")
async def create_note(request: Request):
    try:
        data = await request.json()
        print("Received Note Data:", data)  # ✅ Debugging

        if "title" not in data or "desc" not in data or not data["title"].strip() or not data["desc"].strip():
            raise HTTPException(status_code=400, detail="Title and Description are required.")

        data["important"] = data.get("important", False)

        result = collection.insert_one(data)

        return {"Success": True, "id": str(result.inserted_id)}

    except Exception as e:
        print("Error adding note:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")



@note.put("/notes/{note_id}")
async def update_note(note_id: str, request: Request):
    try:
        obj_id = ObjectId(note_id)  # ✅ Convert note_id to ObjectId
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    try:
        form_data = await request.json()  # ✅ Parse JSON
        print("Received update request:", form_data)  # Debugging print statement

        if not isinstance(form_data, dict):  # ✅ Ensure data is a dictionary
            raise HTTPException(status_code=400, detail="Invalid request format")

        # ✅ Ensure required fields exist
        if "title" not in form_data or "desc" not in form_data:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # ✅ Convert "important" field to boolean
        form_data["important"] = form_data.get("important", False)

        result = collection.update_one({"_id": obj_id}, {"$set": form_data})

        print(f"MongoDB Update Response: Matched={result.matched_count}, Modified={result.modified_count}")

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")

        if result.modified_count == 0:
            return {"Success": False, "message": "No changes detected. Data remains the same."}

        return {"Success": True, "message": "Note updated"}

    except Exception as e:
        print("Error updating note:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")



@note.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    try:
        obj_id = ObjectId(note_id)  # Convert string ID back to ObjectId ✅
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")

    return {"Success": True, "message": "Note deleted"}
