import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('SUPABASE CONFIG ERROR: Missing environment variables.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  updated_at?: string;
};

export type Skill = {
  id: string;
  name: string;
  descripyion: string;
  tier: number;
  prerequisites: string | null;
  icon_name: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  status: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  status: string;
  next_payment: string | null;
  created_at: string;
};
