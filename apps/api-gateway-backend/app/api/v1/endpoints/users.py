"""
User management endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_users():
    """Get all users"""
    return {"message": "Users endpoint - Coming soon"}


@router.post("/")
async def create_user():
    """Create new user"""
    return {"message": "Create user endpoint - Coming soon"}


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    return {"message": f"Get user {user_id} - Coming soon"}
