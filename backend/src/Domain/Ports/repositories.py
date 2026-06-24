from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.Domain.Entities.models import Profile, Exercise, RehabilitationPlan, PlanExercise, SessionResult

class IProfileRepository(ABC):
    @abstractmethod
    async def get_by_id(self, profile_id: UUID) -> Optional[Profile]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[Profile]:
        pass

    @abstractmethod
    async def get_patients_by_specialist(self, specialist_id: UUID) -> List[Profile]:
        pass

    @abstractmethod
    async def get_specialist_stats(self, specialist_id: UUID) -> dict:
        pass

    @abstractmethod
    async def create(self, profile: Profile) -> Profile:
        pass

    @abstractmethod
    async def update(self, profile: Profile) -> Profile:
        pass

class IExerciseRepository(ABC):
    @abstractmethod
    async def get_by_id(self, exercise_id: UUID) -> Optional[Exercise]:
        pass

    @abstractmethod
    async def get_all(self) -> List[Exercise]:
        pass

class IPlanRepository(ABC):
    @abstractmethod
    async def create_plan(self, plan: RehabilitationPlan) -> RehabilitationPlan:
        pass

    @abstractmethod
    async def get_plan_by_id(self, plan_id: UUID) -> Optional[RehabilitationPlan]:
        pass

    @abstractmethod
    async def get_active_plan_by_patient_and_specialist(self, patient_id: UUID, specialist_id: UUID) -> Optional[RehabilitationPlan]:
        pass

    @abstractmethod
    async def get_active_plans_by_patient(self, patient_id: UUID) -> List[RehabilitationPlan]:
        pass

    @abstractmethod
    async def add_exercise_to_plan(self, plan_exercise: PlanExercise) -> PlanExercise:
        pass

    @abstractmethod
    async def get_plan_exercises(self, plan_id: UUID) -> List[PlanExercise]:
        pass

class ISessionResultRepository(ABC):
    @abstractmethod
    async def create(self, session_result: SessionResult) -> SessionResult:
        pass

    @abstractmethod
    async def get_by_patient_id(self, patient_id: UUID) -> List[SessionResult]:
        pass
