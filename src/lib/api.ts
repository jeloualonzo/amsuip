import { supabase } from "../integrations/supabase/client";

export interface Session {
  id: number;
  title: string;
  type: 'class' | 'event' | 'other';
  time_in: string;
  time_out?: string;
  location?: string;
  instructor: string;
  program: string;
  year: string;
  section: string;
  description?: string;
  capacity?: string;
  date: string;
}

export interface Student {
  id: number;
  student_id: string;
  firstname: string;
  middle_initial?: string;
  surname: string;
  program: string;
  year: string;
  section: string;
  sex?: string;
  address?: string;
  contact_no?: string;
  email?: string;
  birthday?: string;
  signature_url?: string;
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  status: string;
  time_in?: string;
  time_out?: string;
  created_at: string;
  updated_at: string;
}

// Sessions API
export const fetchSessions = async (startDate?: string, endDate?: string): Promise<Session[]> => {
  try {
    let query = supabase.from('sessions').select('*');
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

export const createSession = async (sessionData: Omit<Session, 'id'>): Promise<Session> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const updateSession = async (id: number, sessionData: Partial<Session>): Promise<Session> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

export const deleteSession = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Students API
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('surname', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
};

export const getUniquePrograms = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('program')
      .order('program');
    
    if (error) throw error;
    const programs = [...new Set(data?.map(item => item.program as string) || [])];
    return programs.filter(Boolean) as string[];
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

export const getUniqueYearLevels = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('year')
      .order('year');
    
    if (error) throw error;
    const years = [...new Set(data?.map(item => item.year as string) || [])];
    return years.filter(Boolean) as string[];
  } catch (error) {
    console.error('Error fetching year levels:', error);
    return [];
  }
};

export const getUniqueSections = async (program?: string, year?: string): Promise<string[]> => {
  try {
    let query = supabase.from('students').select('section');
    
    if (program) query = query.eq('program', program);
    if (year) query = query.eq('year', year);
    
    const { data, error } = await query.order('section');
    
    if (error) throw error;
    const sections = [...new Set(data?.map(item => item.section as string) || [])];
    return sections.filter(Boolean) as string[];
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
};

export const importStudentsFromCSV = async (students: Omit<Student, 'id'>[]): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert(students)
      .select();
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error importing students:', error);
    throw error;
  }
};

// Attendance API
export const fetchAttendance = async (sessionId?: number): Promise<AttendanceRecord[]> => {
  try {
    let query = supabase.from('attendance').select('*');
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};

export const markAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<AttendanceRecord> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};