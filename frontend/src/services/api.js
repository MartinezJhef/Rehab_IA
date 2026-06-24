const API_URL = 'http://localhost:8000/api';

export const api = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      throw new Error('Credenciales incorrectas');
    }
    return res.json();
  },

  async getProfile(profileId) {
    const res = await fetch(`${API_URL}/profiles/${profileId}`);
    if (!res.ok) {
      throw new Error('Error al cargar perfil');
    }
    return res.json();
  },

  async getExercises() {
    const res = await fetch(`${API_URL}/exercises`);
    if (!res.ok) {
      throw new Error('Error al cargar ejercicios');
    }
    return res.json();
  },

  async getPatientActivePlans(patientId) {
    const res = await fetch(`${API_URL}/plans/patient/${patientId}/active`);
    if (!res.ok) {
      throw new Error('Error al cargar planes');
    }
    return res.json();
  },

  async createPlan(data) {
    const res = await fetch(`${API_URL}/plans/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al crear plan de rehabilitación');
    }
    return res.json();
  },

  async getSpecialistPatients(specialistId) {
    const res = await fetch(`${API_URL}/profiles/specialist/${specialistId}/patients`);
    if (!res.ok) {
      throw new Error('Error al cargar pacientes del especialista');
    }
    return res.json();
  },

  async getSpecialistStats(specialistId) {
    const res = await fetch(`${API_URL}/profiles/specialist/${specialistId}/stats`);
    if (!res.ok) {
      throw new Error('Error al cargar estadisticas del especialista');
    }
    return res.json();
  },

  async getPatientSessions(patientId) {
    const res = await fetch(`${API_URL}/sessions/patient/${patientId}`);
    if (!res.ok) {
      throw new Error('Error al cargar sesiones del paciente');
    }
    return res.json();
  },

  async recordSession(data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${API_URL}/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al guardar la sesión');
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('El servidor tardó demasiado en responder (Timeout).');
      throw err;
    }
  },

  async updateProfile(profileId, data) {
    const res = await fetch(`${API_URL}/profiles/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Error al actualizar perfil');
    }
    return res.json();
  },

  async updatePassword(profileId, newPassword) {
    const res = await fetch(`${API_URL}/auth/update-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, new_password: newPassword })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al actualizar contraseña');
    }
    return res.json();
  }
};

export default api;
