from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date
from uuid import UUID

class PlanExerciseCreateDTO(BaseModel):
    exercise_id: UUID
    frequency_weekly: int = Field(gt=0, le=7)
    series: int = 3
    repetitions: int = 10
    duration_seconds: Optional[int] = None

class PlanCreateDTO(BaseModel):
    specialist_id: UUID
    patient_id: UUID
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    total_sessions: Optional[int] = 20
    exercises: List[PlanExerciseCreateDTO]

class PlanExerciseResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    exercise_id: UUID
    frequency_weekly: int
    series: int
    repetitions: int
    duration_seconds: Optional[int]

class PlanResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    specialist_id: UUID
    patient_id: UUID
    title: str
    description: Optional[str]
    is_active: bool
    start_date: date
    end_date: Optional[date]
    total_sessions: Optional[int] = 20
    exercises: List[PlanExerciseResponseDTO] = []
