from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from src.Domain.ValueObjects.enums import SessionStatus

class SessionResultCreateDTO(BaseModel):
    patient_id: UUID
    exercise_id: UUID
    plan_exercise_id: Optional[UUID] = None
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    completed_repetitions: int = 0
    correct_repetitions: int = 0
    incorrect_repetitions: int = 0
    accuracy_percentage: float = Field(ge=0, le=100)
    status: SessionStatus = SessionStatus.COMPLETADA

class SessionResultResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    patient_id: UUID
    exercise_id: UUID
    plan_exercise_id: Optional[UUID]
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    completed_repetitions: int
    correct_repetitions: int
    incorrect_repetitions: int
    accuracy_percentage: float
    status: SessionStatus
