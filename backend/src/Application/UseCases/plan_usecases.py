from uuid import UUID, uuid4
from datetime import datetime

from src.Domain.Entities.models import RehabilitationPlan, PlanExercise
from src.Domain.Ports.repositories import IPlanRepository, IProfileRepository, IExerciseRepository
from src.Domain.Exceptions.domain_exceptions import (
    ActivePlanAlreadyExistsException,
    ProfileNotFoundException,
    ExerciseNotFoundException
)
from src.Application.DTOs.plan_dtos import PlanCreateDTO

class PlanUseCases:
    def __init__(
        self,
        plan_repo: IPlanRepository,
        profile_repo: IProfileRepository,
        exercise_repo: IExerciseRepository
    ):
        self.plan_repo = plan_repo
        self.profile_repo = profile_repo
        self.exercise_repo = exercise_repo

    async def get_patient_active_plans(self, patient_id: UUID):
        plans = await self.plan_repo.get_active_plans_by_patient(patient_id)
        result = []
        for plan in plans:
            exercises = await self.plan_repo.get_plan_exercises(plan.id)
            plan_dict = plan.model_dump()
            plan_dict["exercises"] = [ex.model_dump() for ex in exercises]
            result.append(plan_dict)
        return result

    async def assign_plan_to_patient(self, dto: PlanCreateDTO) -> RehabilitationPlan:
        # Validar existencia de especialista y paciente
        specialist = await self.profile_repo.get_by_id(dto.specialist_id)
        if not specialist:
            raise ProfileNotFoundException(str(dto.specialist_id))
            
        patient = await self.profile_repo.get_by_id(dto.patient_id)
        if not patient:
            raise ProfileNotFoundException(str(dto.patient_id))

        # (Restricción de un solo plan activo removida por petición del usuario)

        # Crear el plan
        plan_id = uuid4()
        new_plan = RehabilitationPlan(
            id=plan_id,
            specialist_id=dto.specialist_id,
            patient_id=dto.patient_id,
            title=dto.title,
            description=dto.description,
            is_active=True,
            start_date=dto.start_date,
            end_date=dto.end_date,
            total_sessions=dto.total_sessions,
            created_at=datetime.utcnow()
        )
        
        created_plan = await self.plan_repo.create_plan(new_plan)

        # Validar y agregar los ejercicios
        for ex_dto in dto.exercises:
            exercise = await self.exercise_repo.get_by_id(ex_dto.exercise_id)
            if not exercise:
                raise ExerciseNotFoundException(str(ex_dto.exercise_id))
                
            plan_exercise = PlanExercise(
                id=uuid4(),
                plan_id=created_plan.id,
                exercise_id=ex_dto.exercise_id,
                frequency_weekly=ex_dto.frequency_weekly,
                series=ex_dto.series,
                repetitions=ex_dto.repetitions,
                duration_seconds=ex_dto.duration_seconds,
                created_at=datetime.utcnow()
            )
            await self.plan_repo.add_exercise_to_plan(plan_exercise)

        return created_plan
