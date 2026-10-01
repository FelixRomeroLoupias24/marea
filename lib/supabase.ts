import { createClient } from '@supabase/supabase-js'

// Next reemplaza las NEXT_PUBLIC_* en el build solo si se leen así, de forma literal.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local (reiniciá `pnpm dev` después de crearlas).')
}

// Cliente del navegador: la sesión se guarda y se renueva sola (localStorage). La anon key es pública por diseño;
// lo que protege los datos son las políticas de seguridad por fila (RLS) de la base.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
