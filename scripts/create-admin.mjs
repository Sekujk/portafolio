// Script puntual para crear el usuario admin en Supabase Auth.
// Usa la service_role key (bypasea RLS) -- solo correr localmente, nunca en el frontend.
//
// Requiere en el entorno: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// ADMIN_EMAIL, ADMIN_PASSWORD.
//
// Uso:
//   node scripts/create-admin.mjs

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !email || !password) {
  console.error('Faltan variables de entorno (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD).');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error('Error creando el usuario admin:', error.message);
  process.exit(1);
}

console.log('Usuario admin creado correctamente.');
console.log('user id:', data.user.id);
console.log('email:', data.user.email);
