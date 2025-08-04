-- Phase 1: Add new columns to students table and create attendance_sessions table

-- Add new columns to students table for additional data we'll need
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS middle_initial text,
ADD COLUMN IF NOT EXISTS sex text,
ADD COLUMN IF NOT EXISTS contact_no text,
ADD COLUMN IF NOT EXISTS signature_images text[],
ADD COLUMN IF NOT EXISTS signature_confidence_level integer DEFAULT 0;

-- Create attendance_sessions table for tracking completed attendance
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_by uuid NOT NULL REFERENCES public.profiles(id),
  total_students integer NOT NULL DEFAULT 0,
  present_count integer NOT NULL DEFAULT 0,
  absent_count integer NOT NULL DEFAULT 0,
  late_count integer NOT NULL DEFAULT 0,
  excused_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on attendance_sessions
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance_sessions
CREATE POLICY "Admins and instructors can manage attendance sessions" 
ON public.attendance_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Authenticated users can view attendance sessions" 
ON public.attendance_sessions 
FOR SELECT 
USING (true);

-- Add trigger for attendance_sessions updated_at
CREATE TRIGGER update_attendance_sessions_updated_at
BEFORE UPDATE ON public.attendance_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();