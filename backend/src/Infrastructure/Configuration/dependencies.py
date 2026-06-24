from fastapi import Depends
from supabase import Client

from src.Infrastructure.Adapters.Out.database import get_supabase_client
from src.Infrastructure.Adapters.Out.repositories_impl import (
    SupabaseProfileRepository,
    SupabaseExerciseRepository,
    SupabasePlanRepository,
    SupabaseSessionResultRepository
)
from src.Application.UseCases.profile_usecases import ProfileUseCases
from src.Application.UseCases.plan_usecases import PlanUseCases
from src.Application.UseCases.session_usecases import SessionUseCases
from src.Application.UseCases.exercise_usecases import ExerciseUseCases

# Dependencias de Repositorios
def get_profile_repository(client: Client = Depends(get_supabase_client)) -> SupabaseProfileRepository:
    return SupabaseProfileRepository(client)

def get_exercise_repository(client: Client = Depends(get_supabase_client)) -> SupabaseExerciseRepository:
    return SupabaseExerciseRepository(client)

def get_plan_repository(client: Client = Depends(get_supabase_client)) -> SupabasePlanRepository:
    return SupabasePlanRepository(client)

def get_session_repository(client: Client = Depends(get_supabase_client)) -> SupabaseSessionResultRepository:
    return SupabaseSessionResultRepository(client)

# Dependencias de Casos de Uso
def get_profile_use_cases(repo: SupabaseProfileRepository = Depends(get_profile_repository)) -> ProfileUseCases:
    return ProfileUseCases(repo)

def get_exercise_use_cases(repo: SupabaseExerciseRepository = Depends(get_exercise_repository)) -> ExerciseUseCases:
    return ExerciseUseCases(repo)

def get_plan_use_cases(
    plan_repo: SupabasePlanRepository = Depends(get_plan_repository),
    profile_repo: SupabaseProfileRepository = Depends(get_profile_repository),
    exercise_repo: SupabaseExerciseRepository = Depends(get_exercise_repository)
) -> PlanUseCases:
    return PlanUseCases(plan_repo=plan_repo, profile_repo=profile_repo, exercise_repo=exercise_repo)

def get_session_use_cases(repo: SupabaseSessionResultRepository = Depends(get_session_repository)) -> SessionUseCases:
    return SessionUseCases(repo)
