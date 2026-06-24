from enum import Enum

class UserRole(str, Enum):
    PACIENTE = "paciente"
    ESPECIALISTA = "especialista"

class SessionStatus(str, Enum):
    COMPLETADA = "completada"
    ABANDONADA = "abandonada"
