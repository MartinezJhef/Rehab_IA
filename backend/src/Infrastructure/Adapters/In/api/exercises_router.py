from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from src.Application.DTOs.exercise_dtos import ExerciseResponseDTO
from src.Application.UseCases.exercise_usecases import ExerciseUseCases
from src.Infrastructure.Configuration.dependencies import get_exercise_use_cases

router = APIRouter(prefix="/api/exercises", tags=["Exercises"])

@router.get("/", response_model=List[ExerciseResponseDTO])
async def get_all_exercises(use_cases: ExerciseUseCases = Depends(get_exercise_use_cases)):
    try:
        return await use_cases.get_all_exercises()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{exercise_id}", response_model=ExerciseResponseDTO)
async def get_exercise(
    exercise_id: UUID, 
    use_cases: ExerciseUseCases = Depends(get_exercise_use_cases)
):
    try:
        return await use_cases.get_exercise(exercise_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
