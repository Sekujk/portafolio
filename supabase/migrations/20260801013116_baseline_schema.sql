-- Baseline: refleja el esquema actualmente vivo en el proyecto Supabase de Portafolio,
-- reconstruido a partir de supabase-setup.sql, supabase-storage.sql y
-- supabase-projects-storage.sql (scripts sueltos, no versionados, ejecutados
-- manualmente en el SQL Editor de Supabase hasta ahora).
--
-- Este archivo NO se ha aplicado contra el proyecto remoto todavia.
-- Es el punto de partida para versionar el esquema con `supabase db push`
-- en vez de pegar SQL a mano en el dashboard.
--
-- No inserta datos semilla / placeholder: el objetivo es documentar la
-- estructura, no tocar el contenido real que ya existe en produccion.

-- =====================================================
-- TABLA: portfolio_data
-- =====================================================

create table if not exists portfolio_data (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default',
  data jsonb not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_portfolio_user_id on portfolio_data(user_id);

alter table portfolio_data enable row level security;

drop policy if exists "Permitir lectura pública" on portfolio_data;
create policy "Permitir lectura pública"
  on portfolio_data for select
  using (true);

drop policy if exists "Permitir escritura pública temporal" on portfolio_data;
create policy "Permitir escritura pública temporal"
  on portfolio_data for all
  using (true);

-- =====================================================
-- TABLA: admin_auth
-- =====================================================

create table if not exists admin_auth (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default' unique,
  password_hash text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_admin_auth_user_id on admin_auth(user_id);

alter table admin_auth enable row level security;

drop policy if exists "Permitir lectura pública admin" on admin_auth;
create policy "Permitir lectura pública admin"
  on admin_auth for select
  using (true);

drop policy if exists "Permitir escritura pública admin" on admin_auth;
create policy "Permitir escritura pública admin"
  on admin_auth for all
  using (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_portfolio_data_updated_at on portfolio_data;
create trigger update_portfolio_data_updated_at
    before update on portfolio_data
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_admin_auth_updated_at on admin_auth;
create trigger update_admin_auth_updated_at
    before update on admin_auth
    for each row
    execute function update_updated_at_column();

-- =====================================================
-- STORAGE: bucket portfolio-images
-- =====================================================

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

drop policy if exists "Permitir subida de imágenes" on storage.objects;
create policy "Permitir subida de imágenes"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-images');

drop policy if exists "Permitir lectura pública de imágenes" on storage.objects;
create policy "Permitir lectura pública de imágenes"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

drop policy if exists "Permitir actualizar imágenes" on storage.objects;
create policy "Permitir actualizar imágenes"
  on storage.objects for update
  using (bucket_id = 'portfolio-images');

drop policy if exists "Permitir eliminar imágenes" on storage.objects;
create policy "Permitir eliminar imágenes"
  on storage.objects for delete
  using (bucket_id = 'portfolio-images');

-- NOTA DE SEGURIDAD: las politicas de arriba (portfolio_data, admin_auth y
-- storage.objects) permiten escritura publica sin restriccion -- este es el
-- estado ACTUAL en produccion, documentado tal cual, no una recomendacion.
-- Ver wiki/code/supabase-schema.md para el detalle del riesgo y la propuesta
-- de fix (requiere migrar el login admin a Supabase Auth antes de restringir
-- estas politicas, o el panel /admin deja de poder guardar cambios).
