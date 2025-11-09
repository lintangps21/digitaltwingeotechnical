// 🚨 1. IMPORTANT: We change this to createClient because this file 
// will be used on the SERVER (in your API Route).
import { createClient } from '@supabase/supabase-js';

// 🚨 2. We must access the secret Service Role Key from the server environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// You may still have a separate file for the client browser client, 
// but this file is for the server only.

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for server client.');
}

// 🚨 3. Use the createClient function with the Service Role Key.
// This client bypasses RLS, so use it carefully and only on the server!
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);