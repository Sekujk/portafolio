-- Rediseño relacional del portafolio. Reemplaza el modelo de "un JSONB gigante"
-- (portfolio_data) y la autenticación custom (admin_auth + bcrypt) por:
--   - Tablas normalizadas, una por entidad del portafolio.
--   - Supabase Auth real para el admin (auth.users), en vez de una tabla propia.
--
-- Se parte de cero (confirmado por el usuario, sin datos de producción que
-- preservar). Este archivo SÍ es destructivo (drops), pero solo contra las
-- tablas del baseline anterior (20260801013116_baseline_schema.sql).
--
-- Requiere, antes o después de aplicar esto, crear el usuario admin en
-- Supabase Auth (auth.admin.createUser) -- no se crea desde SQL.

-- =====================================================
-- LIMPIEZA DEL ESQUEMA ANTERIOR
-- =====================================================

drop trigger if exists update_portfolio_data_updated_at on portfolio_data;
drop trigger if exists update_admin_auth_updated_at on admin_auth;

drop table if exists portfolio_data;
drop table if exists admin_auth;

-- update_updated_at_column() se reutiliza para las tablas nuevas, no se borra.

-- =====================================================
-- HELPER: política de "solo admin autenticado escribe"
-- =====================================================
-- Convención para todas las tablas de abajo:
--   - select: público (true)
--   - insert/update/delete: solo auth.role() = 'authenticated'
-- (un solo admin real vía Supabase Auth; no hay multi-usuario ni roles).

-- =====================================================
-- TABLA: personal_info (fila única)
-- =====================================================

create table personal_info (
  id uuid default gen_random_uuid() primary key,
  name text not null default '',
  title text not null default '',
  email text,
  phone text,
  location text,
  avatar_url text,
  bio text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table personal_info enable row level security;

create policy "personal_info: lectura pública"
  on personal_info for select
  using (true);

create policy "personal_info: escritura solo admin autenticado"
  on personal_info for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create trigger update_personal_info_updated_at
  before update on personal_info
  for each row
  execute function update_updated_at_column();

-- Fila única para editar (upsert por id fijo desde el frontend).
insert into personal_info (id) values ('00000000-0000-0000-0000-000000000001');

-- =====================================================
-- TABLA: education
-- =====================================================

create table education (
  id uuid default gen_random_uuid() primary key,
  institution text not null,
  degree text not null,
  period text,             -- texto libre, ej. "2021 -- 2026" (fechas no siempre son YYYY-MM exactas)
  description text,
  order_index int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table education enable row level security;

create policy "education: lectura pública"
  on education for select
  using (true);

create policy "education: escritura solo admin autenticado"
  on education for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create trigger update_education_updated_at
  before update on education
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- TABLA: experience
-- =====================================================

create table experience (
  id uuid default gen_random_uuid() primary key,
  company text not null,
  role text not null,
  location text,
  period text,              -- texto libre, ej. "Ago 2024 -- Sep 2024"
  description text,
  technologies text[] not null default '{}',
  order_index int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table experience enable row level security;

create policy "experience: lectura pública"
  on experience for select
  using (true);

create policy "experience: escritura solo admin autenticado"
  on experience for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create trigger update_experience_updated_at
  before update on experience
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- TABLA: skills
-- =====================================================

create table skills (
  id uuid default gen_random_uuid() primary key,
  category text not null,   -- ej. 'frontend', 'backend', 'database', 'tools'
  name text not null,
  order_index int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index idx_skills_category on skills(category);

alter table skills enable row level security;

create policy "skills: lectura pública"
  on skills for select
  using (true);

create policy "skills: escritura solo admin autenticado"
  on skills for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =====================================================
-- TABLA: projects
-- =====================================================

create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  technologies text[] not null default '{}',
  image_url text,
  github_url text,
  demo_url text,
  featured boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table projects enable row level security;

create policy "projects: lectura pública"
  on projects for select
  using (true);

create policy "projects: escritura solo admin autenticado"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- TABLA: certifications
-- =====================================================
-- NOTA: no había datos reales de ejemplo para certifications (estaba vacía
-- en el JSONB actual). Columnas propuestas según lo típico de un CV;
-- `Requiere confirmación` del usuario si necesita campos distintos.

create table certifications (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  issuer text,
  date text,               -- texto libre, ej. "Jul 2025"
  url text,
  order_index int not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table certifications enable row level security;

create policy "certifications: lectura pública"
  on certifications for select
  using (true);

create policy "certifications: escritura solo admin autenticado"
  on certifications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE: portfolio-images -- restringir escritura al admin autenticado
-- =====================================================

drop policy if exists "Permitir subida de imágenes" on storage.objects;
create policy "portfolio-images: solo admin autenticado sube"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

drop policy if exists "Permitir actualizar imágenes" on storage.objects;
create policy "portfolio-images: solo admin autenticado actualiza"
  on storage.objects for update
  using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

drop policy if exists "Permitir eliminar imágenes" on storage.objects;
create policy "portfolio-images: solo admin autenticado elimina"
  on storage.objects for delete
  using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

-- La lectura pública de imágenes (creada en el baseline) se mantiene igual.
