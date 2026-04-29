import { supabase } from './supabase';

export const userApi = {
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, level, xp'); 
      
      if (error) return [];
      return data || [];
    } catch (err) {
      return [];
    }
  },

  async createUser(userData: { username: string; level: number; xp: number }) {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ 
          ...userData, 
          id: crypto.randomUUID() 
        }]); 
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw err;
    }
  },

  async updateUser(id: string, userData: { username: string; level: number; xp: number }) {
    try {
      if (!id) return;
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      throw err;
    }
  },

  async deleteUser(id: string) {
    try {
      if (!id) return;
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      throw err;
    }
  }
};
