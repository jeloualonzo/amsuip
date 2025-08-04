import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Star,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AttendanceForm from "@/components/AttendanceForm";
import { sessionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Schedule = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSessionCreated = () => {
    setIsAddSessionOpen(false);
    fetchSessions();
  };

  // Filter sessions for today
  const todaysSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.toDateString() === currentDate.toDateString();
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "class": return <BookOpen className="w-4 h-4" />;
      case "event": return <Calendar className="w-4 h-4" />;
      case "other": return <Star className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "class": 
        return <Badge className="bg-primary/10 text-primary border-primary/20">Class</Badge>;
      case "event": 
        return <Badge className="bg-accent/10 text-accent border-accent/20">Event</Badge>;
      case "other": 
        return <Badge className="bg-education-navy/10 text-education-navy border-education-navy/20">Activity</Badge>;
      default: 
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleViewStudents = (session: any) => {
    setSelectedSession(session);
    setIsStudentDialogOpen(true);
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
            <h1 className="text-3xl font-bold text-education-navy">Schedule Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage daily schedules and upcoming sessions.
            </p>
          </div>
          <Button 
            className="bg-gradient-primary shadow-glow"
            onClick={() => setIsAddSessionOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </div>

        {/* Date Navigation */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigateDate('prev')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Day
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-education-navy">
                  {formatDate(currentDate)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {todaysSessions.length} sessions scheduled
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => navigateDate('next')}
                className="flex items-center gap-2"
              >
                Next Day
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-education-navy flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Schedule
          </h3>
          
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            ) : todaysSessions.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-education-navy mb-2">No sessions scheduled</h3>
                  <p className="text-muted-foreground mb-4">There are no sessions scheduled for this date.</p>
                  <Button onClick={() => setIsAddSessionOpen(true)} className="bg-gradient-primary shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                </CardContent>
              </Card>
            ) : (
              todaysSessions.map((session) => (
                <Card key={session.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-primary/10">
                          {getTypeIcon(session.session_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-education-navy">{session.title}</h4>
                            {getTypeBadge(session.session_type)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.start_time} - {session.end_time || 'Ongoing'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </div>
                            {session.capacity && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Capacity: {session.capacity}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.program} {session.instructor?.first_name && `• ${session.instructor.first_name} ${session.instructor.last_name}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewStudents(session)}
                          className="gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Weekly Overview */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-education-navy">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const isToday = index === currentDate.getDay() - 1;
                const sessionCount = Math.floor(Math.random() * 8) + 2; // Mock data
                
                return (
                  <div 
                    key={day} 
                    className={`p-4 rounded-lg border text-center transition-all duration-300 ${
                      isToday 
                        ? 'bg-gradient-primary text-primary-foreground border-primary shadow-glow' 
                        : 'bg-background/50 border-border/50 hover:bg-gradient-primary/5'
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    <div className="text-2xl font-bold mt-1">
                      {index + 25}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      {sessionCount} sessions
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-navy">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{sessions.filter(s => s.session_type === 'class').length}</div>
              <div className="text-sm text-muted-foreground">Classes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent">{sessions.filter(s => s.session_type === 'event').length}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-green">{sessions.filter(s => s.session_type === 'other').length}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </CardContent>
          </Card>
        </div>

        {/* Students Dialog */}
        <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Students in {selectedSession?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Session</p>
                  <p className="font-medium">{selectedSession?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedSession?.start_time} - {selectedSession?.end_time || 'Ongoing'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedSession?.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-medium">{selectedSession?.instructor ? `${selectedSession.instructor.first_name} ${selectedSession.instructor.last_name}` : 'TBD'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Session Details</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> {selectedSession?.session_type}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Program:</span> {selectedSession?.program}
                  </p>
                  {selectedSession?.description && (
                    <p className="text-sm">
                      <span className="font-medium">Description:</span> {selectedSession.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Session Dialog */}
        <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Session
              </DialogTitle>
            </DialogHeader>
            <AttendanceForm onSessionCreated={handleSessionCreated} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Schedule;