import { supabase } from '../supabaseClient';

export const authService = {
  login: async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    const { data: adminRecord, error: adminError } = await supabase
      .from('admins')
      .select('email, active')
      .eq('email', email)
      .single();

    if (adminError || !adminRecord) {
      await supabase.auth.signOut();
      throw new Error('Acceso Denegado: Tu correo no está autorizado como administrador.');
    }

    if (!adminRecord.active) {
      await supabase.auth.signOut();
      throw new Error('Acceso Suspendido: Tu cuenta ha sido desactivada por un administrador.');
    }
    return authData;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  fetchAdmins: async () => {
    const { data, error } = await supabase.from('admins').select('*');
    if (error) throw error;
    return data || [];
  },

  addAdmin: async (email, active = true) => {
    const { error } = await supabase.from('admins').insert([{ email, active }]);
    if (error) throw error;
  },

  updateAdmin: async (id, updates) => {
    const { error } = await supabase.from('admins').update(updates).eq('id', id);
    if (error) throw error;
  },

  signUpAdmin: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  deleteAdmin: async (id) => {
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) throw error;
  },

  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
};
