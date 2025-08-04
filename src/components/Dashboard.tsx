import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { studentsApi, sessionsApi, attendanceSessionsApi } from "@/lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    activeSessions: 0,
    completedToday: 0
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsData, sessionsData, attendanceSessionsData] = await Promise.all([
        studentsApi.getAll(),
        sessionsApi.getAll(),
        attendanceSessionsApi.getAll()
      ]);

      const today = new Date().toDateString();
      const todaySessions = sessionsData.filter(session => 
        new Date(session.date).toDateString() === today
      );
      const completedToday = attendanceSessionsData.filter(session =>
        new Date(session.completed_at).toDateString() === today
      );

      setStats({
        totalStudents: studentsData.length,
        todayAttendance: 0, // This would need actual attendance data calculation
        activeSessions: todaySessions.length,
        completedToday: completedToday.length
      });

      setRecentSessions(sessionsData.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = (session: any) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const today = new Date().toDateString();
    
    if (sessionDate.toDateString() === today) {
      return "Active";
    } else if (sessionDate < now) {
      return "Completed";
    } else {
      return "Scheduled";
    }
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      icon: Users,
      change: `${stats.totalStudents} enrolled`,
      color: "text-education-blue"
    },
    {
      title: "Today's Sessions",
      value: stats.activeSessions.toString(),
      icon: UserCheck,
      change: `${stats.activeSessions} scheduled`,
      color: "text-accent"
    },
    {
      title: "Active Sessions",
      value: stats.activeSessions.toString(),
      icon: Clock,
      change: "Real-time data",
      color: "text-primary"
    },
    {
      title: "Completed Today",
      value: stats.completedToday.toString(),
      icon: CheckCircle,
      change: "Attendance taken",
      color: "text-education-green"
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-education-navy">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Link to="/take-attendance">
          <Button className="bg-gradient-primary shadow-glow hover:shadow-elegant transition-all duration-300">
            <UserCheck className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-education-navy mt-1">
                      {stat.value}
                    </p>
                    <p className={`text-sm mt-1 ${stat.color} flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-primary/10`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-education-navy">
              <Calendar className="w-5 h-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No sessions found</p>
            ) : (
              recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                  <div>
                    <h4 className="font-medium text-education-navy">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">{session.program} • {session.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getSessionStatus(session) === 'Active' ? 'bg-accent/10 text-accent' :
                      getSessionStatus(session) === 'Completed' ? 'bg-education-green/10 text-education-green' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {getSessionStatus(session)}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{session.start_time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-education-navy">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/take-attendance">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-gradient-primary/5">
                <UserCheck className="w-5 h-5" />
                Start New Attendance Session
              </Button>
            </Link>
            <Link to="/students">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-gradient-accent/5">
                <Users className="w-5 h-5" />
                Manage Students
              </Button>
            </Link>
            <Link to="/records">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-gradient-primary/5">
                <Calendar className="w-5 h-5" />
                View Attendance Records
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;