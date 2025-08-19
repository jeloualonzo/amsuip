import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Clock, AlertCircle, CheckCircle2, Plus, Search, Filter, Eye, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";

type ExcuseStatus = 'pending' | 'approved' | 'rejected';

type ExcuseApplication = {
  id: string;
  student_id: number;
  session_id?: number;
  absence_date: string;
  reason: string;
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
  reason: string;
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
    absence_date: '',
    reason: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

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
      const { error } = await supabase
        .from('excuse_applications')
        .insert([{
          student_id: parseInt(formData.student_id),
          session_id: formData.session_id ? parseInt(formData.session_id) : null,
          absence_date: formData.absence_date,
          reason: formData.reason,
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
        reason: '',
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
      accessorKey: "student.firstname",
      header: "Student",
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
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        const reason = row.getValue("reason") as string;
        return (
          <div className="max-w-xs truncate" title={reason}>
            {reason}
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
              searchKey="student.firstname"
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
              <Select
                value={formData.student_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.firstname} {student.surname} ({student.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="session">Session (Optional)</Label>
              <Select
                value={formData.session_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, session_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.title} - {format(new Date(session.date), 'MMM d, yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="absence_date">Absence Date</Label>
              <Input
                id="absence_date"
                type="date"
                value={formData.absence_date}
                onChange={(e) => setFormData(prev => ({ ...prev, absence_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain the reason for absence..."
              />
            </div>

            <div>
              <Label htmlFor="documentation">Documentation URL (Optional)</Label>
              <Input
                id="documentation"
                value={formData.documentation_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, documentation_url: e.target.value }))}
                placeholder="Link to supporting documents..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitExcuse}
              disabled={!formData.student_id || !formData.absence_date || !formData.reason}
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
                <Label className="text-sm font-medium">Reason</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedExcuse.reason}</p>
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