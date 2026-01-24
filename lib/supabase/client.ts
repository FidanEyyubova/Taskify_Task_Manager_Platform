import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};


// "!" means Non-null assertion operator — TypeScript-də olan ! işarəsidir
// və mənası çox sadədir 👇
// “Bu dəyər null və ya undefined DEYİL, mən buna əminəm.”