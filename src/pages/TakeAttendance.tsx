import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { sessionsApi, studentsApi, attendanceApi, attendanceSessionsApi } from "@/lib/api";

const TakeAttendance = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [signatureResult, setSignatureResult] = useState<any>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsApi.getAll();
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (session: any) => {
    setSelectedSession(session);
    setIsAttendanceDialogOpen(true);
    
    try {
      // Get students for this session based on program, year level, and section
      const allStudents = await studentsApi.getAll();
      let sessionStudents = allStudents;

      // Filter students based on session criteria
      if (session.program) {
        sessionStudents = sessionStudents.filter(s => s.program === session.program);
      }
      if (session.year_level) {
        sessionStudents = sessionStudents.filter(s => s.year_level === session.year_level);
      }
      if (session.section) {
        sessionStudents = sessionStudents.filter(s => s.section === session.section);
      }

      setStudents(sessionStudents);
      
      // Initialize attendance state
      const attendanceState: {[key: string]: any} = {};
      sessionStudents.forEach(student => {
        attendanceState[student.id] = { status: 'absent', notes: '' };
      });
      setAttendance(attendanceState);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students for this session.",
        variant: "destructive",
      });
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused', notes?: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { status, notes: notes || '' }
    }));
  };

  const handleSignatureCapture = (student: any) => {
    setCurrentStudent(student);
    setIsSignatureDialogOpen(true);
    
    // Simulate signature recognition
    setTimeout(() => {
      const confidence = student.signature_confidence_level || 0;
      const isMatch = confidence > 70 && Math.random() > 0.3; // Simulate matching logic
      
      setSignatureResult({
        matched: isMatch,
        confidence: confidence,
        student: student
      });
      
      if (isMatch) {
        handleAttendanceChange(student.id, 'present');
        toast({
          title: "Signature Matched",
          description: `${student.first_name} ${student.last_name} marked as present.`,
        });
      } else {
        toast({
          title: "Signature Not Matched",
          description: "Please verify manually or capture another signature.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;

    try {
      // Save individual attendance records
      for (const studentId in attendance) {
        const attendanceRecord = attendance[studentId];
        await attendanceApi.markAttendance(
          selectedSession.id,
          studentId,
          attendanceRecord.status,
          attendanceRecord.notes
        );
      }

      // Calculate stats
      const stats = Object.values(attendance).reduce((acc: any, record: any) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {});

      // Create attendance session record
      await attendanceSessionsApi.create({
        session_id: selectedSession.id,
        total_students: students.length,
        present_count: stats.present || 0,
        absent_count: stats.absent || 0,
        late_count: stats.late || 0,
        excused_count: stats.excused || 0
      });

      toast({
        title: "Attendance Saved",
        description: "Attendance has been recorded successfully.",
      });

      setIsAttendanceDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-education-navy">Take Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Select a session to start taking attendance with AI signature recognition.
            </p>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-education-navy flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Sessions
          </h3>
          
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-education-navy mb-2">No sessions available</h3>
                  <p className="text-muted-foreground">Create a session first to start taking attendance.</p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-primary/10">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-education-navy">{session.title}</h4>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              {session.session_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.start_time} - {session.end_time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.program} • Year {session.year_level} • Section {session.section}
                          </p>
                        </div>
                      </div>

                      <Button 
                        className="bg-gradient-primary shadow-glow"
                        onClick={() => handleSessionSelect(session)}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Take Attendance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Attendance Dialog */}
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Taking Attendance: {selectedSession?.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Session Info */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Time:</span> {selectedSession?.start_time} - {selectedSession?.end_time}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {selectedSession?.location}
                    </div>
                    <div>
                      <span className="font-medium">Students:</span> {students.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Students List */}
              <div className="space-y-4">
                <h4 className="font-semibold">Students</h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <Card key={student.id} className="bg-background">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-sm">
                              <p className="font-medium">{student.first_name} {student.last_name}</p>
                              <p className="text-muted-foreground">ID: {student.student_id}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSignatureCapture(student)}
                              className="gap-1"
                            >
                              <Camera className="w-3 h-3" />
                              Scan Signature
                            </Button>
                            
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={attendance[student.id]?.status === 'present' ? 'default' : 'outline'}
                                onClick={() => handleAttendanceChange(student.id, 'present')}
                                className="gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={attendance[student.id]?.status === 'absent' ? 'default' : 'outline'}
                                onClick={() => handleAttendanceChange(student.id, 'absent')}
                                className="gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant={attendance[student.id]?.status === 'late' ? 'default' : 'outline'}
                                onClick={() => handleAttendanceChange(student.id, 'late')}
                                className="gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                Late
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAttendance} className="bg-gradient-primary">
                  Save Attendance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Signature Recognition Dialog */}
        <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Signature Recognition</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 text-center">
              <div className="p-8 border-2 border-dashed border-border rounded-lg">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {signatureResult ? "Recognition Complete" : "Capturing and analyzing signature..."}
                </p>
              </div>
              
              {signatureResult && (
                <div className="space-y-3">
                  <div className={`text-lg font-medium ${signatureResult.matched ? 'text-green-600' : 'text-red-600'}`}>
                    {signatureResult.matched ? 'Signature Matched!' : 'Signature Not Matched'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Student: {signatureResult.student.first_name} {signatureResult.student.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {signatureResult.confidence}%
                  </div>
                  {signatureResult.matched && (
                    <div className="text-sm text-green-600">
                      Student marked as present
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TakeAttendance;