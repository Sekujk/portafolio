-- Fix advisor warning "function_search_path_mutable": fija el search_path de
-- la función para que no dependa del search_path de quien la invoque
-- (previene un vector de hijacking bien documentado en Postgres/Supabase).

create or replace function update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;
