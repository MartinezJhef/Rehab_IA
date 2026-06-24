-- 1. TIPOS PERSONALIZADOS (ENUMS)
CREATE TYPE public.user_role AS ENUM ('paciente', 'especialista');
CREATE TYPE public.session_status AS ENUM ('completada', 'abandonada');

-- 2. TABLA DE PERFILES (Extiende auth.users de Supabase)
-- HU01 (Registro), HU14 (Edición de Perfil)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'paciente',
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120),
    age INT CHECK (age > 18),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500), -- URL del bucket Supabase Storage (HU14)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE EJERCICIOS TERAPÉUTICOS
-- HU07 (Selección de ejercicio), HU13 (Video de Ejemplo)
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    video_url VARCHAR(500), -- URL en Supabase Storage (HU13)
    
    -- Parámetros para MediaPipe/IA (HU05)
    -- Guardados como JSONB para tener flexibilidad por cada tipo de ejercicio
    -- Ejemplo: {"joint": "elbow", "min_angle": 30, "max_angle": 160}
    ai_parameters JSONB NOT NULL, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA DE PLANES DE REHABILITACIÓN
-- HU08 (Asignación de plan por el especialista)
CREATE TABLE public.rehabilitation_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Un paciente solo puede tener un plan activo con un mismo especialista a la vez
    CONSTRAINT unique_active_plan UNIQUE (patient_id, specialist_id, is_active)
);

-- 5. TABLA INTERMEDIA: EJERCICIOS ASIGNADOS A UN PLAN
-- HU08 (Detalle del plan: series, repeticiones)
CREATE TABLE public.plan_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.rehabilitation_plans(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    frequency_weekly INT NOT NULL CHECK (frequency_weekly > 0 AND frequency_weekly <= 7),
    series INT DEFAULT 3,
    repetitions INT DEFAULT 10,
    duration_seconds INT, -- Para ejercicios isométricos que dependen de tiempo y no de repeticiones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA DE RESULTADOS DE SESIÓN
-- HU09 (Registro de resultados), HU10 y HU11 (Visualización de Progreso)
CREATE TABLE public.session_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    plan_exercise_id UUID REFERENCES public.plan_exercises(id) ON DELETE SET NULL, -- Puede ser nulo si practicó libremente
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INT NOT NULL,
    
    completed_repetitions INT NOT NULL DEFAULT 0,
    correct_repetitions INT NOT NULL DEFAULT 0,
    incorrect_repetitions INT NOT NULL DEFAULT 0,
    
    accuracy_percentage NUMERIC(5,2) NOT NULL CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    status session_status NOT NULL DEFAULT 'completada',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security) - RNF09 y RNF04
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehabilitation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_results ENABLE ROW LEVEL SECURITY;

-- Los pacientes solo ven su propio perfil, los especialistas ven el suyo y el de sus pacientes asignados.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Los pacientes solo ven sus propios resultados
CREATE POLICY "Patients view their own results" ON public.session_results FOR SELECT USING (auth.uid() = patient_id);