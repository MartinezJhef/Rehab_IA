from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from uuid import UUID

from src.Domain.ValueObjects.enums import UserRole, SessionStatus

class Profile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    role: UserRole = UserRole.PACIENTE
    first_name: str
    last_name: Optional[str] = None
    age: Optional[int] = Field(default=None, gt=18)
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    specialist_id: Optional[UUID] = None
    clinical_observations: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Exercise(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    description: Optional[str] = None
    instructions: str
    video_url: Optional[str] = None
    ai_parameters: Dict[str, Any]
    created_at: Optional[datetime] = None

class RehabilitationPlan(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    specialist_id: UUID
    patient_id: UUID
    title: str
    description: Optional[str] = None
    is_active: bool = True
    start_date: date
    end_date: Optional[date] = None
    total_sessions: Optional[int] = 20
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PlanExercise(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    plan_id: UUID
    exercise_id: UUID
    frequency_weekly: int = Field(gt=0, le=7)
    series: int = 3
    repetitions: int = 10
    duration_seconds: Optional[int] = None
    created_at: Optional[datetime] = None

class SessionResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
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
    created_at: Optional[datetime] = None
