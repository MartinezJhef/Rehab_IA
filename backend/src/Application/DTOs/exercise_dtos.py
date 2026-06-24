from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any

class ExerciseResponseDTO(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    instructions: str
    video_url: Optional[str] = None
    ai_parameters: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
