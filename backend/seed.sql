-- IMPORTANTE: Para que este script funcione en Supabase, asegúrate de que los usuarios existan
-- previamente en auth.users, o de lo contrario la Foreign Key fallará.
-- Como estamos insertando directamente en 'profiles', Supabase requiere que los IDs
-- correspondan a registros en auth.users. 

-- -----------------------------------------------------------------------------
-- 0. CREACIÓN DE USUARIOS EN AUTH.USERS (Opcional/Dependiente de permisos)
-- -----------------------------------------------------------------------------
-- Si tienes permisos de postgres superuser, puedes descomentar esto para crear los 
-- usuarios en la tabla auth.users directamente. En Supabase suele ser necesario 
-- registrar los usuarios por la interfaz web o API primero.
--
-- INSERT INTO auth.users (id, email) VALUES 
-- ('8ddf2031-7e82-4a28-ab8d-15aabf22c152', 'jheferson@rehab.com'),
-- ('3ebbe91a-e0d8-4a2a-a86b-8602bbcf98db', 'drgomez@rehab.com');

-- -----------------------------------------------------------------------------
-- 1. INSERTAR PERFILES (Especialista y Paciente)
-- -----------------------------------------------------------------------------
-- ID del Paciente: 8ddf2031-7e82-4a28-ab8d-15aabf22c152
-- ID del Especialista: 3ebbe91a-e0d8-4a2a-a86b-8602bbcf98db (Proporcionado por el usuario)

INSERT INTO public.profiles (id, role, first_name, last_name, age, email, phone, specialist_id) 
VALUES 
    (
        '8ddf2031-7e82-4a28-ab8d-15aabf22c152', 
        'paciente', 
        'Jheferson', 
        'Martínez', 
        28, 
        'jheferson@rehab.com', 
        '987654321',
        '3ebbe91a-e0d8-4a2a-a86b-8602bbcf98db'
    ),
    (
        '3ebbe91a-e0d8-4a2a-a86b-8602bbcf98db', 
        'especialista', 
        'Roberto', 
        'Gómez', 
        45, 
        'drgomez@rehab.com', 
        '123456789',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role, 
    first_name = EXCLUDED.first_name, 
    last_name = EXCLUDED.last_name,
    specialist_id = EXCLUDED.specialist_id;

-- -----------------------------------------------------------------------------
-- 2. INSERTAR EJERCICIOS
-- -----------------------------------------------------------------------------
-- ID 1: Flexión de Codo
-- ID 2: Elevación Frontal
-- ID 3: Abducción Lateral

INSERT INTO public.exercises (id, name, description, instructions, ai_parameters)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111',
        'Flexión de Codo (Bíceps/Codo)',
        'Ejercicio enfocado en la recuperación de la movilidad articular del codo.',
        '1. Mantén la espalda recta. 2. Deja el brazo estirado. 3. Flexiona el codo levantando la mano hacia el hombro hasta que el ángulo sea menor a 40°. 4. Baja lentamente.',
        '{"joint": "elbow", "min_angle": 35, "max_angle": 160}'::jsonb
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        'Elevación Frontal de Brazo',
        'Fortalecimiento del deltoides anterior.',
        '1. De pie, levanta el brazo estirado hacia adelante hasta la altura del hombro (90°). 2. Desciende con control.',
        '{"joint": "shoulder", "axis": "frontal", "target_angle": 90}'::jsonb
    ),
    (
        'e3333333-3333-3333-3333-333333333333',
        'Abducción Lateral',
        'Mejora la movilidad lateral del hombro.',
        '1. Levanta el brazo hacia un lado sin flexionar el codo hasta llegar a los 90°. 2. Baja lentamente.',
        '{"joint": "shoulder", "axis": "lateral", "target_angle": 90}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. INSERTAR PLAN DE REHABILITACIÓN
-- -----------------------------------------------------------------------------
INSERT INTO public.rehabilitation_plans (id, specialist_id, patient_id, title, description, is_active, start_date, end_date)
VALUES
    (
        '55555555-5555-5555-5555-555555555555',
        '3ebbe91a-e0d8-4a2a-a86b-8602bbcf98db', -- Especialista: Dr. Gómez
        '8ddf2031-7e82-4a28-ab8d-15aabf22c152', -- Paciente: Jheferson
        'Rehabilitación de Miembro Superior - Fase 1',
        'Plan enfocado en recuperar la movilidad del codo y hombro derecho.',
        TRUE,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days'
    )
ON CONFLICT ON CONSTRAINT unique_active_plan DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. ASIGNAR EJERCICIOS AL PLAN
-- -----------------------------------------------------------------------------
INSERT INTO public.plan_exercises (id, plan_id, exercise_id, frequency_weekly, series, repetitions)
VALUES
    (
        '66666666-6666-6666-6666-666666666666',
        '55555555-5555-5555-5555-555555555555', -- El plan creado arriba
        'e1111111-1111-1111-1111-111111111111', -- Flexión de codo
        5, -- 5 veces a la semana
        3, -- 3 series
        10 -- 10 repeticiones
    ),
    (
        '77777777-7777-7777-7777-777777777777',
        '55555555-5555-5555-5555-555555555555',
        'e2222222-2222-2222-2222-222222222222', -- Elevación frontal
        3,
        3,
        8
    )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. INSERTAR RESULTADOS DE SESIONES (HISTÓRICO)
-- -----------------------------------------------------------------------------
-- Simulamos un par de sesiones que el paciente Jheferson ya realizó ayer y hoy
INSERT INTO public.session_results (id, patient_id, exercise_id, plan_exercise_id, start_time, end_time, duration_seconds, completed_repetitions, correct_repetitions, incorrect_repetitions, accuracy_percentage, status)
VALUES
    -- Sesión de ayer (Flexión de Codo)
    (
        uuid_generate_v4(),
        '8ddf2031-7e82-4a28-ab8d-15aabf22c152',
        'e1111111-1111-1111-1111-111111111111',
        '66666666-6666-6666-6666-666666666666',
        CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '15 minutes',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        900,
        30,
        25,
        5,
        83.33,
        'completada'
    ),
    -- Sesión de hoy (Elevación Frontal)
    (
        uuid_generate_v4(),
        '8ddf2031-7e82-4a28-ab8d-15aabf22c152',
        'e2222222-2222-2222-2222-222222222222',
        '77777777-7777-7777-7777-777777777777',
        CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '10 minutes',
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        600,
        24,
        22,
        2,
        91.66,
        'completada'
    )
ON CONFLICT DO NOTHING;
