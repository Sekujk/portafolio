-- Fix advisors: auth_rls_initplan + multiple_permissive_policies.
--
-- Las politicas de escritura ("... for all") se solapaban con la politica
-- de lectura publica ("... for select") en SELECT, porque FOR ALL incluye
-- SELECT: Postgres terminaba evaluando dos politicas permisivas por cada
-- lectura en vez de una. Ademas, auth.role() se re-evaluaba por cada fila
-- en vez de una sola vez por query (auth_rls_initplan).
--
-- Fix: la politica de escritura de cada tabla se reemplaza por tres
-- politicas explicitas (insert/update/delete, sin select -- eso ya lo
-- cubre la politica de lectura publica), con auth.role() envuelto en
-- (select ...) para que Postgres lo evalue una sola vez por query.
--
-- Nota de sintaxis: INSERT solo admite WITH CHECK, DELETE solo admite
-- USING, UPDATE admite ambos -- por eso no se puede generalizar con un
-- solo bloque dinamico "for insert, update, delete" en una sola politica.

-- personal_info
drop policy if exists "personal_info: escritura solo admin autenticado" on personal_info;
create policy "personal_info: insert admin autenticado" on personal_info for insert with check ((select auth.role()) = 'authenticated');
create policy "personal_info: update admin autenticado" on personal_info for update using ((select auth.role()) = 'authenticated') with check ((select auth.role()) = 'authenticated');
create policy "personal_info: delete admin autenticado" on personal_info for delete using ((select auth.role()) = 'authenticated');

-- education
drop policy if exists "education: escritura solo admin autenticado" on education;
create policy "education: insert admin autenticado" on education for insert with check ((select auth.role()) = 'authenticated');
create policy "education: update admin autenticado" on education for update using ((select auth.role()) = 'authenticated') with check ((select auth.role()) = 'authenticated');
create policy "education: delete admin autenticado" on education for delete using ((select auth.role()) = 'authenticated');

-- experience
drop policy if exists "experience: escritura solo admin autenticado" on experience;
create policy "experience: insert admin autenticado" on experience for insert with check ((select auth.role()) = 'authenticated');
create policy "experience: update admin autenticado" on experience for update using ((select auth.role()) = 'authenticated') with check ((select auth.role()) = 'authenticated');
create policy "experience: delete admin autenticado" on experience for delete using ((select auth.role()) = 'authenticated');

-- skills
drop policy if exists "skills: escritura solo admin autenticado" on skills;
create policy "skills: insert admin autenticado" on skills for insert with check ((select auth.role()) = 'authenticated');
create policy "skills: update admin autenticado" on skills for update using ((select auth.role()) = 'authenticated') with check ((select auth.role()) = 'authenticated');
create policy "skills: delete admin autenticado" on skills for delete using ((select auth.role()) = 'authenticated');

-- projects
drop policy if exists "projects: escritura solo admin autenticado" on projects;
create policy "projects: insert admin autenticado" on projects for insert with check ((select auth.role()) = 'authenticated');
create policy "projects: update admin autenticado" on projects for update using ((select auth.role()) = 'authenticated') with check ((select auth.role()) = 'authenticated');
create policy "projects: delete admin autenticado" on projects for delete using ((select auth.role()) = 'authenticated');

-- certifications
drop policy if exists "certifications: escritura solo admin autenticado" on certifications;
create policy "certifications: insert admin autenticado" on certifications for insert with check ((select auth.role()) = 'authenticated');
create policy "certifications: update admin autenticado" on certifications for update using ((select auth.role()) = 'authenticated') with check ((select auth.role()) = 'authenticated');
create policy "certifications: delete admin autenticado" on certifications for delete using ((select auth.role()) = 'authenticated');
