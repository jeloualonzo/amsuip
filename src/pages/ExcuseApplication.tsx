import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Clock, AlertCircle, CheckCircle2, Plus, Search, Filter, Eye, Check, X, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

type ExcuseStatus = 'pending' | 'approved' | 'rejected';

type ExcuseApplication = {
  id: string;
  student_id: number;
  session_id?: number;
  absence_date: string;
  excuse_image_url?: string;
  documentation_url?: string;
  status: ExcuseStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  student?: {
    firstname: string;
    surname: string;
    student_id: string;
    program: string;
    year: string;
    section: string;
  };
  session?: {
    title: string;
    date: string;
  };
};

type ExcuseFormData = {
  student_id: string;
  session_id?: string;
  absence_date: string;
  excuse_image?: File;
  documentation_url?: string;
};

const ExcuseApplicationContent = () => {
  const { toast } = useToast();
  const [excuses, setExcuses] = useState<ExcuseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExcuse, setSelectedExcuse] = useState<ExcuseApplication | null>(null);
  const [formData, setFormData] = useState<ExcuseFormData>({
    student_id: '',
    absence_date: '', // Keep for type compatibility but won't be used
  });
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
  const [openSessionSelect, setOpenSessionSelect] = useState(false);

  useEffect(() => {
    fetchExcuses();
    fetchStudents();
    fetchSessions();
  }, []);

  const fetchExcuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('excuse_applications')
        .select(`
          *,
          students:student_id (
            firstname,
            surname,
            student_id,
            program,
            year,
            section
          ),
          sessions:session_id (
            title,
            date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExcuses(data || []);
    } catch (error) {
      console.error('Error fetching excuses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch excuse applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, firstname, surname, student_id, program, year, section')
        .order('firstname');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, title, date')
        .order('date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSubmitExcuse = async () => {
    try {
      let excuse_image_url = null;
      
      // Upload image if provided
      if (formData.excuse_image) {
        const fileExt = formData.excuse_image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `excuse-letters/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('excuse-letters')
          .upload(filePath, formData.excuse_image);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('excuse-letters')
          .getPublicUrl(filePath);
          
        excuse_image_url = publicUrl;
      }

      const { error } = await supabase
        .from('excuse_applications')
        .insert([{
          student_id: parseInt(formData.student_id),
          session_id: formData.session_id ? parseInt(formData.session_id) : null,
          absence_date: new Date().toISOString().split('T')[0], // Use current date
          excuse_image_url: excuse_image_url,
          documentation_url: formData.documentation_url,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Excuse application submitted successfully",
      });

      setIsFormOpen(false);
      setFormData({
        student_id: '',
        absence_date: '',
      });
      fetchExcuses();
    } catch (error) {
      console.error('Error submitting excuse:', error);
      toast({
        title: "Error",
        description: "Failed to submit excuse application",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: ExcuseStatus, notes?: string) => {
    try {
      const { error } = await supabase
        .from('excuse_applications')
        .update({
          status,
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Excuse application ${status}`,
      });

      fetchExcuses();
      setIsViewOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: ExcuseStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const columns: ColumnDef<ExcuseApplication>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
      accessorFn: (row) => `${row.student?.firstname || ''} ${row.student?.surname || ''}`.trim(),
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div>
            <div className="font-medium">
              {student?.firstname} {student?.surname}
            </div>
            <div className="text-sm text-muted-foreground">
              {student?.student_id} • {student?.program}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "absence_date",
      header: "Absence Date",
      cell: ({ row }) => {
        return format(new Date(row.getValue("absence_date")), 'MMM d, yyyy');
      },
    },
    {
      accessorKey: "excuse_image_url",
      header: "Excuse Letter",
      cell: ({ row }) => {
        const imageUrl = row.original.excuse_image_url;
        return (
          <div className="flex items-center gap-2">
            {imageUrl ? (
              <div className="flex items-center gap-2">
                <img 
                  src={imageUrl} 
                  alt="Excuse letter" 
                  className="w-8 h-8 rounded object-cover cursor-pointer"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
                <span className="text-green-600 text-sm">Uploaded</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("status"));
      },
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => {
        return format(new Date(row.getValue("created_at")), 'MMM d, yyyy');
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const excuse = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedExcuse(excuse);
              setIsViewOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        );
      },
    },
  ];

  const filterOptions = [
    {
      label: "Status",
      value: "status",
      options: [
        { label: "All Statuses", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ];

  return (
    <div className="flex-1 space-y-4 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Excuse Applications</h1>
          <p className="text-muted-foreground">
            Review and manage student excuse applications for absences
          </p>
        </div>
        <Button 
          className="bg-gradient-primary shadow-glow h-9"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={excuses}
              searchKey="studentName"
              filterOptions={filterOptions}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Excuse Application</DialogTitle>
            <DialogDescription>
              Submit a new excuse application for a student absence.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudentSelect}
                    className="w-full justify-between"
                  >
                    {formData.student_id
                      ? students.find((student) => student.id.toString() === formData.student_id)?.firstname + ' ' + students.find((student) => student.id.toString() === formData.student_id)?.surname + ' (' + students.find((student) => student.id.toString() === formData.student_id)?.student_id + ')'
                      : "Select student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search students..." />
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {students.map((student) => (
                        <CommandItem
                          key={student.id}
                          onSelect={() => {
                            setFormData(prev => ({ ...prev, student_id: student.id.toString() }));
                            setOpenStudentSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.student_id === student.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {student.firstname} {student.surname} ({student.student_id})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="session">Session *</Label>
              <Popover open={openSessionSelect} onOpenChange={setOpenSessionSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSessionSelect}
                    className="w-full justify-between"
                  >
                    {formData.session_id
                      ? sessions.find((session) => session.id.toString() === formData.session_id)?.title + ' - ' + format(new Date(sessions.find((session) => session.id.toString() === formData.session_id)?.date), 'MMM d, yyyy')
                      : "Select session..."}
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search sessions or dates..." />
                    <CommandEmpty>No session found.</CommandEmpty>
                    <CommandGroup>
                      {sessions.map((session) => (
                        <CommandItem
                          key={session.id}
                          onSelect={() => {
                            setFormData(prev => ({ ...prev, session_id: session.id.toString() }));
                            setOpenSessionSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.session_id === session.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{session.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(session.date), 'EEEE, MMM d, yyyy')}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>


            <div>
              <Label htmlFor="excuse-image">Upload Handwritten Excuse Letter</Label>
              <Input
                id="excuse-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, excuse_image: file }));
                  }
                }}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Please upload a clear photo of your handwritten excuse letter
              </p>
            </div>


          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitExcuse}
              disabled={!formData.student_id || !formData.session_id || !formData.excuse_image}
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Excuse Application Details</DialogTitle>
          </DialogHeader>
          {selectedExcuse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm">
                    {selectedExcuse.student?.firstname} {selectedExcuse.student?.surname}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedExcuse.student?.student_id} • {selectedExcuse.student?.program}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedExcuse.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Absence Date</Label>
                <p className="text-sm">
                  {format(new Date(selectedExcuse.absence_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Excuse Letter</Label>
                {selectedExcuse.excuse_image_url ? (
                  <div className="mt-2">
                    <img 
                      src={selectedExcuse.excuse_image_url} 
                      alt="Excuse letter" 
                      className="max-w-full h-auto rounded border cursor-pointer"
                      onClick={() => window.open(selectedExcuse.excuse_image_url, '_blank')}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No excuse letter uploaded</p>
                )}
              </div>

              {selectedExcuse.documentation_url && (
                <div>
                  <Label className="text-sm font-medium">Documentation</Label>
                  <a
                    href={selectedExcuse.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Documentation
                  </a>
                </div>
              )}

              {selectedExcuse.review_notes && (
                <div>
                  <Label className="text-sm font-medium">Review Notes</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedExcuse.review_notes}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Submitted: {format(new Date(selectedExcuse.created_at), 'MMM d, yyyy h:mm a')}
                {selectedExcuse.reviewed_at && (
                  <span className="ml-4">
                    Reviewed: {format(new Date(selectedExcuse.reviewed_at), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>

              {selectedExcuse.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleUpdateStatus(selectedExcuse.id, 'approved')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleUpdateStatus(selectedExcuse.id, 'rejected')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ExcuseApplication = () => {
  return (
    <Layout>
      <ExcuseApplicationContent />
    </Layout>
  );
};

export default ExcuseApplication;
