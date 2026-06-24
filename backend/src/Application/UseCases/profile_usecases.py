from uuid import UUID
from datetime import datetime

from src.Domain.Entities.models import Profile
from src.Domain.Ports.repositories import IProfileRepository
from src.Domain.Exceptions.domain_exceptions import ProfileNotFoundException
from src.Application.DTOs.profile_dtos import ProfileCreateDTO, ProfileUpdateDTO

class ProfileUseCases:
    def __init__(self, profile_repo: IProfileRepository):
        self.profile_repo = profile_repo

    async def get_profile(self, profile_id: UUID) -> Profile:
        profile = await self.profile_repo.get_by_id(profile_id)
        if not profile:
            raise ProfileNotFoundException(str(profile_id))
        return profile

    async def get_profile_by_email(self, email: str) -> Profile:
        profile = await self.profile_repo.get_by_email(email)
        if not profile:
            raise ProfileNotFoundException(email)
        return profile

    async def get_specialist_patients(self, specialist_id: UUID) -> list[Profile]:
        return await self.profile_repo.get_patients_by_specialist(specialist_id)

    async def get_specialist_dashboard_stats(self, specialist_id: UUID) -> dict:
        return await self.profile_repo.get_specialist_stats(specialist_id)

    async def register_profile(self, dto: ProfileCreateDTO) -> Profile:
        # Aquí se asume que Auth (Supabase) ya creó el ID
        profile = Profile(
            id=dto.id,
            role=dto.role,
            first_name=dto.first_name,
            last_name=dto.last_name,
            age=dto.age,
            email=dto.email,
            phone=dto.phone,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        return await self.profile_repo.create(profile)

    async def update_profile(self, profile_id: UUID, dto: ProfileUpdateDTO) -> Profile:
        profile = await self.get_profile(profile_id)
        
        if dto.first_name is not None:
            profile.first_name = dto.first_name
        if dto.last_name is not None:
            profile.last_name = dto.last_name
        if dto.age is not None:
            profile.age = dto.age
        if dto.phone is not None:
            profile.phone = dto.phone
        if dto.avatar_url is not None:
            profile.avatar_url = dto.avatar_url
        if dto.clinical_observations is not None:
            profile.clinical_observations = dto.clinical_observations
            
        profile.updated_at = datetime.utcnow()
        return await self.profile_repo.update(profile)
