from uuid import UUID
from typing import List

from src.Domain.Entities.models import Exercise
from src.Domain.Ports.repositories import IExerciseRepository
from src.Application.DTOs.exercise_dtos import ExerciseResponseDTO

class ExerciseUseCases:
    def __init__(self, exercise_repo: IExerciseRepository):
        self.exercise_repo = exercise_repo

    async def get_all_exercises(self) -> List[Exercise]:
        return await self.exercise_repo.get_all()

    async def get_exercise(self, exercise_id: UUID) -> Exercise:
        exercise = await self.exercise_repo.get_by_id(exercise_id)
        if not exercise:
            raise Exception("Exercise not found")
        return exercise
