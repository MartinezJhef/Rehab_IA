class DomainException(Exception):
    """Clase base para excepciones de dominio."""
    pass

class ProfileNotFoundException(DomainException):
    def __init__(self, profile_id: str):
        super().__init__(f"Profile with id {profile_id} not found.")

class ExerciseNotFoundException(DomainException):
    def __init__(self, exercise_id: str):
        super().__init__(f"Exercise with id {exercise_id} not found.")

class ActivePlanAlreadyExistsException(DomainException):
    def __init__(self, patient_id: str, specialist_id: str):
        super().__init__(
            f"Patient {patient_id} already has an active plan with specialist {specialist_id}."
        )

class PlanNotFoundException(DomainException):
    def __init__(self, plan_id: str):
        super().__init__(f"Rehabilitation plan with id {plan_id} not found.")
