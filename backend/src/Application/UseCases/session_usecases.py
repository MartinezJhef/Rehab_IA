from uuid import uuid4
from datetime import datetime

from src.Domain.Entities.models import SessionResult
from src.Domain.Ports.repositories import ISessionResultRepository
from src.Application.DTOs.session_dtos import SessionResultCreateDTO

class SessionUseCases:
    def __init__(self, session_repo: ISessionResultRepository):
        self.session_repo = session_repo

    async def record_session_result(self, dto: SessionResultCreateDTO) -> SessionResult:
        # En una app real se podrían validar que plan_exercise exista, 
        # que paciente y ejercicio existan.
        
        result = SessionResult(
            id=uuid4(),
            patient_id=dto.patient_id,
            exercise_id=dto.exercise_id,
            plan_exercise_id=dto.plan_exercise_id,
            start_time=dto.start_time,
            end_time=dto.end_time,
            duration_seconds=dto.duration_seconds,
            completed_repetitions=dto.completed_repetitions,
            correct_repetitions=dto.correct_repetitions,
            incorrect_repetitions=dto.incorrect_repetitions,
            accuracy_percentage=dto.accuracy_percentage,
            status=dto.status,
            created_at=datetime.utcnow()
        )
        return await self.session_repo.create(result)

    async def get_patient_sessions(self, patient_id):
        # Devuelve las sesiones de un paciente ordenadas por fecha (implementación base)
        # La BD o el repo se encarga de retornar los datos
        return await self.session_repo.get_by_patient_id(patient_id)
