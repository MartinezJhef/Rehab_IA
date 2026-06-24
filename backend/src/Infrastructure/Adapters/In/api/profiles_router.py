from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from src.Application.DTOs.profile_dtos import ProfileCreateDTO, ProfileUpdateDTO, ProfileResponseDTO
from src.Application.UseCases.profile_usecases import ProfileUseCases
from src.Infrastructure.Configuration.dependencies import get_profile_use_cases
from src.Domain.Exceptions.domain_exceptions import ProfileNotFoundException

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

@router.post("/", response_model=ProfileResponseDTO, status_code=status.HTTP_201_CREATED)
async def register_profile(
    dto: ProfileCreateDTO, 
    use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        return await use_cases.register_profile(dto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{profile_id}", response_model=ProfileResponseDTO)
async def get_profile(
    profile_id: UUID, 
    use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        return await use_cases.get_profile(profile_id)
    except ProfileNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/by-email/{email}", response_model=ProfileResponseDTO)
async def get_profile_by_email(
    email: str, 
    use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        return await use_cases.get_profile_by_email(email)
    except ProfileNotFoundException as e:
        raise HTTPException(status_code=404, detail=f"User with email {email} not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/specialist/{specialist_id}/patients", response_model=list[ProfileResponseDTO])
async def get_specialist_patients(
    specialist_id: UUID, 
    use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        return await use_cases.get_specialist_patients(specialist_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/specialist/{specialist_id}/stats")
async def get_specialist_stats(
    specialist_id: UUID, 
    use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        return await use_cases.get_specialist_dashboard_stats(specialist_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{profile_id}", response_model=ProfileResponseDTO)
async def update_profile(
    profile_id: UUID, 
    dto: ProfileUpdateDTO, 
    use_cases: ProfileUseCases = Depends(get_profile_use_cases)
):
    try:
        return await use_cases.update_profile(profile_id, dto)
    except ProfileNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
