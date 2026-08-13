-- Tablas para el proyecto "Explicador Económico del Perú"
-- (code/ExplicadorEconomico, repo aparte: github.com/Sekujk/explicador-economico-peru),
-- consumidas directo por la página pública del portafolio.
--
-- A diferencia del resto de las tablas de este esquema, acá NO hay política
-- de escritura para 'authenticated' -- los datos los escribe únicamente el
-- pipeline (GitHub Actions programado), conectado directo a Postgres con la
-- contraseña de servicio (bypassa RLS por default en Supabase). Ni siquiera
-- el admin autenticado del panel /admin puede escribir acá desde el navegador.

create table dim_indicador (
  id serial primary key,
  codigo_interno text unique not null,
  codigo_fuente text not null,
  nombre text not null,
  unidad text not null,
  fuente text not null,
  frecuencia text not null
);

alter table dim_indicador enable row level security;

create policy "dim_indicador: lectura pública"
  on dim_indicador for select
  using (true);

create table fact_valor (
  id serial primary key,
  indicador_id int not null references dim_indicador(id),
  fecha date not null,
  valor numeric(18, 6) not null,
  unique (indicador_id, fecha)
);

create index idx_fact_valor_indicador_fecha on fact_valor(indicador_id, fecha);

alter table fact_valor enable row level security;

create policy "fact_valor: lectura pública"
  on fact_valor for select
  using (true);
