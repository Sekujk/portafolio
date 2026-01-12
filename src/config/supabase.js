import { createClient } from '@supabase/supabase-js';

// PASO 1: Ve a https://supabase.com y crea un proyecto
// PASO 2: En Settings > API, copia estos valores:

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tabla: portfolio_data
// Estructura:
// - id: uuid (primary key)
// - user_id: text (por si quieres múltiples usuarios)
// - data: jsonb (toda la info del portafolio)
// - updated_at: timestamp
