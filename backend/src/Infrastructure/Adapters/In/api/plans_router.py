from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from src.Application.DTOs.plan_dtos import PlanCreateDTO, PlanResponseDTO
from src.Application.UseCases.plan_usecases import PlanUseCases
from src.Infrastructure.Configuration.dependencies import get_plan_use_cases
from src.Domain.Exceptions.domain_exceptions import (
    ActivePlanAlreadyExistsException,
    ProfileNotFoundException,
    ExerciseNotFoundException
)

router = APIRouter(prefix="/api/plans", tags=["Rehabilitation Plans"])

@router.post("/", response_model=PlanResponseDTO, status_code=status.HTTP_201_CREATED)
async def assign_plan(
    dto: PlanCreateDTO, 
    use_cases: PlanUseCases = Depends(get_plan_use_cases)
):
    try:
        return await use_cases.assign_plan_to_patient(dto)
    except (ProfileNotFoundException, ExerciseNotFoundException) as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ActivePlanAlreadyExistsException as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patient/{patient_id}/active")
async def get_patient_active_plans(
    patient_id: UUID,
    use_cases: PlanUseCases = Depends(get_plan_use_cases)
):
    try:
        return await use_cases.get_patient_active_plans(patient_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
