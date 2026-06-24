from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from src.Infrastructure.Adapters.Out.database import get_supabase_client
from src.Infrastructure.Configuration.dependencies import get_profile_use_cases
from src.Application.UseCases.profile_usecases import ProfileUseCases
from src.Application.DTOs.profile_dtos import ProfileResponseDTO

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdatePasswordRequest(BaseModel):
    profile_id: str
    new_password: str

@router.post("/login", response_model=ProfileResponseDTO)
async def login(
    req: LoginRequest,
    supabase: Client = Depends(get_supabase_client),
    profile_use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        # Autenticar con Supabase Auth
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        if not res.user:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
        # Obtener datos del perfil extendido
        profile = await profile_use_cases.get_profile_by_email(req.email)
        return profile
    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

@router.put("/update-password")
async def update_password(
    req: UpdatePasswordRequest,
    supabase: Client = Depends(get_supabase_client)
):
    try:
        res = supabase.auth.admin.update_user_by_id(
            req.profile_id,
            {"password": req.new_password}
        )
        return {"message": "Contraseña actualizada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
