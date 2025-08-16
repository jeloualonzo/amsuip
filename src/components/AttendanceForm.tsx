import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Users, BookOpen, Calendar, Star, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchStudents } from "@/lib/supabaseService";

export type AttendanceType = "class" | "event" | "other";

export interface SessionData {
  title: string;
  program: string;
  year: string;
  section: string;
  date: string;
  timeIn: string;
  timeOut: string;
  description: string;
  venue: string;
  capacity: string;
  attendanceType: AttendanceType;
}

interface AttendanceFormProps {
  onSuccess?: () => void;
  onSubmit?: (session: SessionData) => void;
  initialData?: Partial<SessionData> & { id?: number };
}

const AttendanceForm = ({ onSuccess, onSubmit, initialData }: AttendanceFormProps) => {
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(initialData?.attendanceType || "class");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    program: initialData?.program || "",
    year: initialData?.year || "",
    section: initialData?.section || "",
    date: initialData?.date || "",
    timeIn: initialData?.timeIn || "",
    timeOut: initialData?.timeOut || "",
    description: initialData?.description || "",
    venue: initialData?.venue || "",
    capacity: initialData?.capacity || ""
  });
  
  // State for dropdown options
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [studentOptions, setStudentOptions] = useState<{
    programs: string[];
    years: string[];
    sections: { [key: string]: string[] };
  }>({ programs: [], years: [], sections: {} });
  
  // Available sections based on selected program and year
  const availableSections = useCallback(() => {
    if (!formData.program || !formData.year) return [];
    const key = `${formData.program}|${formData.year}`;
    return studentOptions.sections[key] || [];
  }, [formData.program, formData.year, studentOptions.sections]);
  
  // Fetch students for a specific program and year
  const fetchStudents = async (program: string, year: string) => {
    try {
      // Convert year to the format stored in the database (e.g., '1st' instead of '1st Year')
      const yearShort = year.replace(' Year', '');
      
      // Fetch students matching the program and year
      const { data, error } = await supabase
        .from('students')
        .select('section')
        .eq('program', program)
        .eq('year', yearShort)
        .not('section', 'is', null);
      
      if (error) throw error;
      
      // Return an array of sections with empty strings converted to 'Uncategorized'
      return (data || []).map(student => ({
        section: student.section || 'Uncategorized'
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student data');
      return [];
    }
  };

  // Load student sections when program or year changes
  const loadStudentSections = useCallback(async (program: string, year: string) => {
    // Skip if no program or year is selected, or if "All Programs" or "All Year Levels" is selected
    if (!program || !year || program === 'All Programs' || year === 'All Year Levels') {
      // Reset sections when "All" is selected
      setStudentOptions(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [`${program}|${year}`]: []
        }
      }));
      
      // Reset section in form data
      if (formData.section) {
        setFormData(prev => ({
          ...prev,
          section: ''
        }));
      }
      return;
    }
    
    setLoadingOptions(true);
    try {
      // Fetch students for the selected program and year
      const students = await fetchStudents(program, year);
      
      // Extract unique sections from the students and filter out any null/undefined values
      const sections = [...new Set(students.map(student => student.section).filter(Boolean))];
      
      // If no sections found, add a default section
      if (sections.length === 0) {
        sections.push('Default Section');
      }
      
      setStudentOptions(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [`${program}|${year}`]: sections
        }
      }));
      
      // If the current section is not in the available sections, reset it
      if (formData.section && !sections.includes(formData.section)) {
        setFormData(prev => ({
          ...prev,
          section: ''
        }));
      }
    } catch (error) {
      console.error('Error in loadStudentSections:', error);
      toast.error('Failed to load student sections');
    } finally {
      setLoadingOptions(false);
    }
  }, [formData.section]);

  // Fetch programs from students table (runs once on component mount)
  const loadPrograms = useCallback(async () => {
    console.log('Starting to load programs...');
    setLoadingOptions(true);
    
    try {
      console.log('Fetching programs from students table...');
      
      let allStudents: { program: string | null }[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      // Fetch all students with pagination
      while (hasMore) {
        const { data, error } = await supabase
          .from('students')
          .select('program')
          .not('program', 'is', null)
          .range(page * pageSize, (page + 1) * pageSize - 1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          allStudents = [...allStudents, ...data];
          page++;
          
          // If we got fewer items than requested, we've reached the end
          if (data.length < pageSize) hasMore = false;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`Fetched ${allStudents.length} students with programs`);
      
      // Process programs
      const programSet = new Set<string>();
      allStudents.forEach(student => {
        if (student.program) {
          const program = student.program.toString().trim();
          if (program) programSet.add(program);
        }
      });
      
      let programs = Array.from(programSet).sort((a, b) => 
        a.localeCompare(b, 'en', { sensitivity: 'base' })
      );
      
      console.log('Unique programs found in students table:', programs);
      
      // Ensure we have programs
      if (programs.length === 0) {
        console.warn('No programs found in database');
        programs = [];
      }
      
      console.log('Final programs to set:', programs);
      
      // Use functional update to ensure we're not batching issues
      setStudentOptions(prev => {
        console.log('Previous programs in state:', prev.programs);
        console.log('New programs to set:', programs);
        
        // Only update if programs have actually changed
        if (JSON.stringify(prev.programs) === JSON.stringify(programs)) {
          console.log('Programs unchanged, skipping state update');
          return prev;
        }
        
        return {
          ...prev,
          programs
        };
      });
      
      // If we have program and year in form data, load sections
      if (formData.program && formData.year) {
        console.log('Loading sections for program:', formData.program, 'year:', formData.year);
        await loadStudentSections(formData.program, formData.year);
      }
    } catch (error) {
      console.error('Error in loadPrograms:', error);
      toast.error('Failed to load programs. Check console for details.');
    } finally {
      console.log('Finished loading programs');
      setLoadingOptions(false);
    }
  }, [formData.program, formData.year, loadStudentSections]);

  // Fetch years - include up to 4th year with consistent formatting
  const loadYears = useCallback(async () => {
    setLoadingOptions(true);
    try {
      console.log('Loading years...');
      
      // Define standard year levels up to 4th year
      const standardYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      
      // Also fetch any additional years that might exist in the database
      const { data, error } = await supabase
        .from('students')
        .select('year')
        .not('year', 'is', null)
        .order('year');
      
      if (error) {
        console.error('Error fetching years from database:', error);
        // Fall back to standard years if there's an error
        setStudentOptions(prev => ({
          ...prev,
          years: [...standardYears]
        }));
        return;
      }
      
      // Get unique years from database and normalize their format
      const dbYears = [...new Set(data.map(item => {
        const year = item.year?.toString().trim();
        // Convert short forms to full forms (e.g., '1st' -> '1st Year')
        if (year?.match(/^\d+(st|nd|rd|th)$/i)) {
          return `${year} Year`;
        }
        return year;
      }))].filter(Boolean) as string[];
      
      // Combine with standard years, remove duplicates, and sort
      const allYears = Array.from(new Set([...standardYears, ...dbYears]))
        .filter(Boolean)
        .sort((a, b) => {
          // Sort by year number
          const getYearNum = (str: string) => parseInt(str, 10);
          return getYearNum(a) - getYearNum(b);
        });
      
      console.log('Available years:', allYears);
      
      setStudentOptions(prev => ({
        ...prev,
        years: allYears
      }));
    } catch (error) {
      console.error('Error fetching years:', error);
      toast.error("Failed to load year levels. Please try again later.");
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // Load programs and years on component mount
  useEffect(() => {
    console.log('Component mounted, initializing data...');
    let isMounted = true;
    
    const initializeData = async () => {
      try {
        console.log('Starting to load programs and years...');
        await Promise.all([loadPrograms(), loadYears()]);
        if (isMounted) {
          console.log('Programs and years loaded successfully');
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
      }
    };
    
    initializeData();
    
    // Add a periodic check to verify programs (for debugging)
    const programCheckInterval = setInterval(() => {
      console.log('Current programs in state:', studentOptions.programs);
    }, 30000); // Log every 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(programCheckInterval);
      console.log('Component unmounted, cleaning up...');
    };
  }, [loadPrograms, loadYears, studentOptions.programs]);
  
  // Load sections when program or year changes
  useEffect(() => {
    if (formData.program && formData.year) {
      loadStudentSections(formData.program, formData.year);
    }
  }, [formData.program, formData.year, loadStudentSections]);
  
  // Reset year and section when program changes
  useEffect(() => {
    if (formData.program && formData.year) {
      // If we have both program and year, ensure the section is valid
      if (formData.section && !availableSections().includes(formData.section)) {
        setFormData(prev => ({
          ...prev,
          section: ""
        }));
      }
    } else if (formData.program) {
      // If only program is selected, reset year and section
      setFormData(prev => ({
        ...prev,
        year: "",
        section: ""
      }));
    } else {
      // If no program is selected, reset both year and section
      setFormData(prev => ({
        ...prev,
        year: "",
        section: ""
      }));
    }
  }, [formData.program, formData.year, formData.section, availableSections]);

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        program: initialData.program || "",
        year: initialData.year || "",
        section: initialData.section || "",
        date: initialData.date || "",
        timeIn: initialData.timeIn || "",
        timeOut: initialData.timeOut || "",
        description: initialData.description || "",
        venue: initialData.venue || "",
        capacity: initialData.capacity || ""
      });
      if (initialData.attendanceType) {
        setAttendanceType(initialData.attendanceType);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the session data
    const sessionData: SessionData = {
      ...formData,
      // Map 'All Programs' and 'All Year Levels' to empty strings for backend processing
      program: formData.program === 'All Programs' ? 'All Programs' : formData.program,
      year: formData.year === 'All Year Levels' ? 'All Years' : formData.year,
      section: formData.section === 'All Sections' ? '' : formData.section,
      attendanceType: attendanceType
    };
    
    try {
      // Call the onSubmit callback if provided (for parent component handling)
      if (onSubmit) {
        onSubmit(sessionData);
      }
      
      // Show success message
      toast.success(`${formData.title} session has been ${initialData?.id ? 'updated' : 'created'} successfully.`);
      
      // Only reset form if we're not in edit mode
      if (!initialData?.id) {
        setFormData({
          title: "",
          program: "",
          year: "",
          section: "",
          date: "",
          timeIn: "",
          timeOut: "",
          description: "",
          venue: "",
          capacity: ""
        });
        setAttendanceType("class");
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error(`Failed to ${initialData?.id ? 'update' : 'create'} session. Please try again.`);
    }
  };

  const getTypeIcon = (type: AttendanceType) => {
    switch (type) {
      case "class": return <BookOpen className="w-5 h-5" />;
      case "event": return <Calendar className="w-5 h-5" />;
      case "other": return <Star className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: AttendanceType) => {
    switch (type) {
      case "class": return "bg-gradient-primary";
      case "event": return "bg-gradient-accent";
      case "other": return "bg-education-navy";
    }
  };

  return (
    <div className="w-full max-w-[53.5rem] mx-auto px-4 py-2">
      <div className="border-b border-border/30 pb-2 flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-education-navy text-xl font-semibold">
          <CalendarIcon className="w-5 h-5 text-education-blue" />
          {initialData?.id ? 'Edit Session' : 'Create New Session'}
        </h2>
      </div>
      
      {/* Type Selection */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: "class" as AttendanceType, label: "Class Session", description: "Regular classroom attendance", bg: "bg-gradient-primary/5" },
            { type: "event" as AttendanceType, label: "School Event", description: "Assemblies, ceremonies, programs", bg: "bg-gradient-accent/5" },
            { type: "other" as AttendanceType, label: "Other Activity", description: "Workshops, field trips, meetings", bg: "bg-education-navy/5" }
          ].map((option) => (
            <div 
              key={option.type} 
              className={`relative rounded-lg p-0.5 ${option.bg} transition-all`}
            >
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all h-full ${attendanceType === option.type ? getTypeColor(option.type) : 'bg-white'}`}
                onClick={() => setAttendanceType(option.type)}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`transition-colors ${attendanceType === option.type ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`}>
                    {getTypeIcon(option.type)}
                  </div>
                  <div className="text-center">
                    <div className={`font-medium text-sm ${attendanceType === option.type ? 'text-white' : 'text-foreground'}`}>
                      {option.label}
                    </div>
                    <div className={`text-xs ${attendanceType === option.type ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {option.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Form */}
      <div className="pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Title */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">
                {attendanceType === "class" ? "Subject/Course Name" : 
                 attendanceType === "event" ? "Event Name" : "Activity Title"}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={attendanceType === "class" ? "e.g., Mathematics 101" : 
                           attendanceType === "event" ? "e.g., Annual Science Fair" : "e.g., Leadership Workshop"}
                className="w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                required
              />
            </div>

            {/* Program */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="program">Program</Label>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent select from opening
                      console.log('Manual refresh triggered');
                      loadPrograms();
                    }}
                    className="text-muted-foreground hover:text-primary p-1 -ml-1"
                    title="Refresh programs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      program: "All Programs",
                      year: "",
                      section: ""
                    }));
                  }}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Select All
                </button>
              </div>
              <Select 
                value={formData.program}
                onValueChange={(value) => {
                  // Reset year and section when program changes
                  setFormData(prev => ({
                    ...prev,
                    program: value,
                    year: "",
                    section: ""
                  }));
                }}
                disabled={loadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingOptions ? "Loading..." : "Select program"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingOptions ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <SelectItem value="All Programs">All Programs</SelectItem>
                      {studentOptions.programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {studentOptions.programs.length} programs available
              </p>
            </div>

            {/* Year Level - Show for class, event, and other types */}
            {(attendanceType === "class" || attendanceType === "event" || attendanceType === "other") && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="year">Year Level</Label>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev, 
                      year: "All Year Levels",
                      section: ""
                    }))}
                    className="text-xs text-muted-foreground hover:text-primary"
                    disabled={!formData.program}
                  >
                    Select All
                  </button>
                </div>
                <Select 
                  value={formData.year === 'All Years' ? 'All Year Levels' : formData.year}
                  onValueChange={(value) => setFormData({...formData, year: value === 'All Year Levels' ? 'All Years' : value, section: ""})}
                  disabled={loadingOptions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <SelectItem value="All Year Levels">All Year Levels</SelectItem>
                        {studentOptions.years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Section - Show for class and other types, but not for events */}
            {(attendanceType === "class" || attendanceType === "other") && (
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData({...formData, section: value})}
                  disabled={
                    !formData.program || 
                    !formData.year ||
                    formData.program === 'All Programs' ||
                    formData.year === 'All Year Levels' ||
                    loadingOptions
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      availableSections().length === 0 ? "No sections available" : "Select section"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : availableSections().length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No sections available for this program/year
                      </div>
                    ) : (
                      availableSections().map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full"
                  required
                />
              </div>

              {/* Time In */}
              <div className="space-y-2">
                <Label htmlFor="timeIn">Start Time</Label>
                <Input
                  id="timeIn"
                  type="time"
                  value={formData.timeIn}
                  onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
                  className="w-full"
                  required
                />
              </div>

              {/* Time Out */}
              <div className="space-y-2">
                <Label htmlFor="timeOut">End Time</Label>
                <Input
                  id="timeOut"
                  type="time"
                  value={formData.timeOut}
                  onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">
                  {attendanceType === "class" ? "Course Description" : 
                   attendanceType === "event" ? "Event Description" : "Activity Description"}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={`Brief description of the ${attendanceType}...`}
                  className="w-full min-h-[80px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-3 pb-4 flex justify-center">
              <Button 
                type="submit" 
                className={`${getTypeColor(attendanceType)} shadow-glow hover:opacity-90 transition-opacity w-full max-w-[400px] min-h-[42px] text-base`}
              >
                <Users className="w-4 h-4 mr-2" />
                {initialData?.id ? 'Update Session' : 'Create Session'}
              </Button>
            </div>
          </form>
        </div>
      </div>
   
  );
};

export default AttendanceForm;