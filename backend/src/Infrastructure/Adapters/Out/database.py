from supabase import create_client, Client
from src.Infrastructure.Configuration.config import settings

# Instancia global del cliente de Supabase
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

def get_supabase_client() -> Client:
    return supabase
