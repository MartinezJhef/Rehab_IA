from typing import List, Optional
from uuid import UUID
from supabase import Client

from src.Domain.Entities.models import Profile, Exercise, RehabilitationPlan, PlanExercise, SessionResult
from src.Domain.Ports.repositories import IProfileRepository, IExerciseRepository, IPlanRepository, ISessionResultRepository

class SupabaseProfileRepository(IProfileRepository):
    def __init__(self, client: Client):
        self.client = client

    async def get_by_id(self, profile_id: UUID) -> Optional[Profile]:
        response = self.client.table("profiles").select("*").eq("id", str(profile_id)).execute()
        if not response.data:
            return None
        return Profile(**response.data[0])

    async def get_by_email(self, email: str) -> Optional[Profile]:
        response = self.client.table("profiles").select("*").eq("email", email).execute()
        if not response.data:
            return None
        return Profile(**response.data[0])

    async def get_patients_by_specialist(self, specialist_id: UUID) -> List[Profile]:
        profiles_res = self.client.table("profiles").select("*").eq("specialist_id", str(specialist_id)).execute()
        return [Profile(**item) for item in profiles_res.data]

    async def get_specialist_stats(self, specialist_id: UUID) -> dict:
        profiles_res = self.client.table("profiles").select("id").eq("specialist_id", str(specialist_id)).execute()
        patient_ids = [p['id'] for p in profiles_res.data]
        
        total_patients = len(patient_ids)
        sessions_today = 0
        require_revision = 0
        
        if patient_ids:
            from datetime import datetime, timezone
            today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            
            # Sesiones de hoy
            sess_res = self.client.table("session_results").select("id").in_("patient_id", patient_ids).gte("start_time", today).execute()
            sessions_today = len(sess_res.data)
            
            # Requieren revisión (ej. accuracy < 80 o estado abandonada)
            rev_res = self.client.table("session_results").select("patient_id").in_("patient_id", patient_ids).lt("accuracy_percentage", 80).execute()
            # Contar pacientes únicos que requieren revisión
            require_revision = len(set([r['patient_id'] for r in rev_res.data]))
            
        return {
            "totalPatients": total_patients,
            "sessionsToday": sessions_today,
            "requireRevision": require_revision
        }

    async def create(self, profile: Profile) -> Profile:
        data = profile.model_dump(mode="json")
        response = self.client.table("profiles").insert(data).execute()
        return Profile(**response.data[0])

    async def update(self, profile: Profile) -> Profile:
        data = profile.model_dump(mode="json", exclude_unset=True)
        response = self.client.table("profiles").update(data).eq("id", str(profile.id)).execute()
        return Profile(**response.data[0])

class SupabaseExerciseRepository(IExerciseRepository):
    def __init__(self, client: Client):
        self.client = client

    async def get_by_id(self, exercise_id: UUID) -> Optional[Exercise]:
        response = self.client.table("exercises").select("*").eq("id", str(exercise_id)).execute()
        if not response.data:
            return None
        return Exercise(**response.data[0])

    async def get_all(self) -> List[Exercise]:
        response = self.client.table("exercises").select("*").execute()
        return [Exercise(**item) for item in response.data]

class SupabasePlanRepository(IPlanRepository):
    def __init__(self, client: Client):
        self.client = client

    async def create_plan(self, plan: RehabilitationPlan) -> RehabilitationPlan:
        data = plan.model_dump(mode="json", exclude_none=True)
        response = self.client.table("rehabilitation_plans").insert(data).execute()
        return RehabilitationPlan(**response.data[0])

    async def get_plan_by_id(self, plan_id: UUID) -> Optional[RehabilitationPlan]:
        response = self.client.table("rehabilitation_plans").select("*").eq("id", str(plan_id)).execute()
        if not response.data:
            return None
        return RehabilitationPlan(**response.data[0])

    async def get_active_plan_by_patient_and_specialist(self, patient_id: UUID, specialist_id: UUID) -> Optional[RehabilitationPlan]:
        response = (
            self.client.table("rehabilitation_plans")
            .select("*")
            .eq("patient_id", str(patient_id))
            .eq("specialist_id", str(specialist_id))
            .eq("is_active", True)
            .execute()
        )
        if not response.data:
            return None
        return RehabilitationPlan(**response.data[0])

    async def get_active_plans_by_patient(self, patient_id: UUID) -> List[RehabilitationPlan]:
        response = (
            self.client.table("rehabilitation_plans")
            .select("*")
            .eq("patient_id", str(patient_id))
            .eq("is_active", True)
            .execute()
        )
        return [RehabilitationPlan(**item) for item in response.data]

    async def add_exercise_to_plan(self, plan_exercise: PlanExercise) -> PlanExercise:
        data = plan_exercise.model_dump(mode="json", exclude_none=True)
        response = self.client.table("plan_exercises").insert(data).execute()
        return PlanExercise(**response.data[0])

    async def get_plan_exercises(self, plan_id: UUID) -> List[PlanExercise]:
        response = self.client.table("plan_exercises").select("*").eq("plan_id", str(plan_id)).execute()
        return [PlanExercise(**item) for item in response.data]

class SupabaseSessionResultRepository(ISessionResultRepository):
    def __init__(self, client: Client):
        self.client = client

    async def create(self, session_result: SessionResult) -> SessionResult:
        data = session_result.model_dump(mode="json", exclude_none=True)
        response = self.client.table("session_results").insert(data).execute()
        return SessionResult(**response.data[0])

    async def get_by_patient_id(self, patient_id: UUID) -> List[SessionResult]:
        response = self.client.table("session_results").select("*").eq("patient_id", str(patient_id)).execute()
        return [SessionResult(**item) for item in response.data]
