import { supabase } from '@/integrations/supabase/client';

// Students API
export const studentsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (student: any) => {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Sessions API
export const sessionsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        instructor:profiles!sessions_instructor_id_fkey(first_name, last_name),
        created_by_profile:profiles!sessions_created_by_fkey(first_name, last_name)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        instructor:profiles!sessions_instructor_id_fkey(first_name, last_name),
        created_by_profile:profiles!sessions_created_by_fkey(first_name, last_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (session: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .insert([{ ...session, created_by: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Attendance API
export const attendanceApi = {
  getBySession: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        student:students(*),
        recorded_by_profile:profiles!attendance_recorded_by_fkey(first_name, last_name)
      `)
      .eq('session_id', sessionId);
    
    if (error) throw error;
    return data;
  },

  markAttendance: async (sessionId: string, studentId: string, status: 'present' | 'absent' | 'late' | 'excused', notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        session_id: sessionId,
        student_id: studentId,
        status: status as any,
        notes,
        recorded_by: user.id,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Profiles API
export const profilesApi = {
  getCurrentProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateProfile: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Excuse Applications API
export const excuseApplicationsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('excuse_applications')
      .select(`
        *,
        student:students(*),
        session:sessions(*),
        reviewed_by_profile:profiles!excuse_applications_reviewed_by_fkey(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (application: any) => {
    const { data, error } = await supabase
      .from('excuse_applications')
      .insert([application])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('excuse_applications')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};