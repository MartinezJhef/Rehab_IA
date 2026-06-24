# 🤖 Rehab_IA - Plataforma Inteligente de Rehabilitación Física

![Rehab_IA Banner](https://img.shields.io/badge/Rehab_IA-AI_Powered_Rehabilitation-4F46E5?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-AI_Tracking-FF6F00?style=for-the-badge)

**Rehab_IA** es un sistema integral de telerehabilitación que utiliza **Inteligencia Artificial y Visión por Computadora (MediaPipe)** para monitorear, validar y guiar a los pacientes durante sus rutinas de terapia física en tiempo real usando únicamente la cámara de su dispositivo.

---

## ✨ Características Principales

* **👁️ Tracking Biomecánico con IA:** Reconocimiento de puntos clave del cuerpo (pose landmarks) en tiempo real para calcular ángulos articulares exactos.
* **🎯 Validación de Ejercicios:** El algoritmo valida si el paciente realiza la fase concéntrica y excéntrica del movimiento de acuerdo a parámetros médicos (ángulos máximos y mínimos).
* **🧠 Soporte Multi-articular:** Algoritmos geométricos configurados para ejercicios de:
  * 💪 **Codo** (Flexión/Extensión)
  * 🪽 **Hombro** (Elevación/Abducción)
  * 🖐️ **Muñeca** (Flexión tendinosa)
  * 🦵 **Rodilla** (Flexión/Extensión)
* **🗣️ Feedback en Tiempo Real:** Interfaz amigable con retroalimentación visual y de voz (Speech Synthesis API) para corregir posturas en vivo.
* **👨‍⚕️ Paneles Especializados (Roles):** 
  * **Especialista:** Asignación de rutinas personalizadas, monitoreo del progreso y gestión de pacientes.
  * **Paciente:** Ejecución gamificada de terapias, estadísticas de precisión y recompensas visuales.

---

## 🏗️ Arquitectura del Sistema

El proyecto está diseñado bajo los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)** y **Domain-Driven Design (DDD)** en el backend, asegurando alta escalabilidad y fácil mantenimiento.

### 💻 Frontend (Presentación y Reactividad)
* **Framework:** React 18 + Vite (SPA de alto rendimiento).
* **Estilos:** Tailwind CSS y efectos de Glassmorphism.
* **Animaciones:** GSAP (GreenSock) para transiciones fluidas de componentes.
* **Visión Artificial:** `@mediapipe/pose` y `@mediapipe/camera_utils`.

### ⚙️ Backend (Core de Negocio)
* **Framework:** FastAPI (Python) asíncrono.
* **Patrón de Diseño:** Arquitectura Hexagonal.
* **Seguridad:** Middlewares CORS estrictos.
* **DTOs:** Pydantic para validación de datos estricta.

### 🗄️ Base de Datos e Infraestructura
* **Proveedor:** Supabase (PostgreSQL).
* **Gestión de Datos:** `supabase-py` para interacciones directas y seguras.
* **Tablas Principales:** Usuarios, Perfiles, Ejercicios, Planes Médicos, y Resultados de Sesiones.

---

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
* Node.js (v18+)
* Python (3.10+)
* Cuenta de Supabase con URL y API Key.

### 1. Clonar el repositorio
```bash
git clone https://github.com/MartinezJhef/Rehab_IA.git
cd Rehab_IA
