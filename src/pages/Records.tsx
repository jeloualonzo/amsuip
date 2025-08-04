import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { attendanceSessionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Records = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceSessions();
  }, []);

  const fetchAttendanceSessions = async () => {
    try {
      setLoading(true);
      const data = await attendanceSessionsApi.getAll();
      setAttendanceSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load attendance records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-education-navy">Attendance Records</h1>
            <p className="text-muted-foreground mt-1">
              View completed attendance sessions and their statistics.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading records...</p>
            </div>
          ) : attendanceSessions.length === 0 ? (
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-education-navy mb-2">No records found</h3>
                <p className="text-muted-foreground">Attendance records will appear here after taking attendance.</p>
              </CardContent>
            </Card>
          ) : (
            attendanceSessions.map((session) => (
              <Card key={session.id} className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-education-navy">{session.session?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.session?.program} • {new Date(session.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">Completed</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-muted-foreground mr-1" />
                        <span className="font-bold text-education-navy">{session.total_students}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        <span className="font-bold text-green-600">{session.present_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <XCircle className="w-4 h-4 text-red-600 mr-1" />
                        <span className="font-bold text-red-600">{session.absent_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="font-bold text-yellow-600">{session.late_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <AlertCircle className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="font-bold text-blue-600">{session.excused_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Excused</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Records;