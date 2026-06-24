from fastapi import APIRouter, Depends, HTTPException, status
from src.Application.DTOs.session_dtos import SessionResultCreateDTO, SessionResultResponseDTO
from src.Application.UseCases.session_usecases import SessionUseCases
from src.Infrastructure.Configuration.dependencies import get_session_use_cases

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.post("/", response_model=SessionResultResponseDTO, status_code=status.HTTP_201_CREATED)
async def record_session(
    dto: SessionResultCreateDTO, 
    use_cases: SessionUseCases = Depends(get_session_use_cases)
):
    try:
        return await use_cases.record_session_result(dto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patient/{patient_id}", response_model=list[SessionResultResponseDTO])
async def get_patient_sessions(
    patient_id, 
    use_cases: SessionUseCases = Depends(get_session_use_cases)
):
    try:
        from uuid import UUID
        patient_uuid = UUID(patient_id) if isinstance(patient_id, str) else patient_id
        return await use_cases.get_patient_sessions(patient_uuid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
