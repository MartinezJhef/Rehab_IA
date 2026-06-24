from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.Infrastructure.Adapters.In.api import profiles_router, plans_router, sessions_router, exercises_router, auth_router

# Instancia de la app FastAPI
app = FastAPI(
    title="Rehab Web API",
    description="Backend para Sistema de Rehabilitación Web con IA (Arquitectura Hexagonal con Supabase REST API)",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Cambiar en producción por los dominios reales
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(auth_router.router)
app.include_router(profiles_router.router)
app.include_router(plans_router.router)
app.include_router(sessions_router.router)
app.include_router(exercises_router.router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Rehab Web API is running connected to Supabase"}
