from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID

from src.Domain.ValueObjects.enums import UserRole

class ProfileCreateDTO(BaseModel):
    id: UUID
    role: UserRole = UserRole.PACIENTE
    first_name: str
    last_name: Optional[str] = None
    age: Optional[int] = Field(default=None, gt=18)
    email: str
    phone: Optional[str] = None

class ProfileUpdateDTO(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = Field(default=None, gt=18)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    clinical_observations: Optional[str] = None

class ProfileResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    role: UserRole
    first_name: str
    last_name: Optional[str]
    age: Optional[int]
    email: str
    phone: Optional[str]
    avatar_url: Optional[str]
    specialist_id: Optional[UUID] = None
    clinical_observations: Optional[str] = None
