import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  CalendarDays,
  AlertCircle,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Clock3,
  CalendarClock,
  FileText,
  Lightbulb,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Skeleton } from "../../components/ui/skeleton";

// Mock data generators
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getFormattedDate = () => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('en-US', options);
};

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [greeting] = useState(getGreeting());
  const [formattedDate] = useState(getFormattedDate());
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalStudents: 0,
    todaysAttendance: 0,
    activeSessions: 0,
    pendingActions: 0
  });

  // Load user-specific data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data based on the user's email domain
        const isStudent = user?.email?.endsWith('@student.school.edu');
        
        setUserStats({
          totalStudents: isStudent ? 1 : 1248,
          todaysAttendance: isStudent ? 1 : 892,
          activeSessions: isStudent ? 1 : 15,
          pendingActions: isStudent ? 3 : 8
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: user?.email?.endsWith('@student.school.edu') ? "My Classes" : "Total Students",
      value: isLoading ? "-" : userStats.totalStudents.toLocaleString(),
      icon: user?.email?.endsWith('@student.school.edu') ? BookOpen : Users,
      change: user?.email?.endsWith('@student.school.edu') ? "View your schedule" : "+12% from last month",
      color: "text-education-blue"
    },
    {
      title: user?.email?.endsWith('@student.school.edu') ? "My Attendance" : "Today's Attendance",
      value: isLoading ? "-" : userStats.todaysAttendance.toLocaleString(),
      icon: user?.email?.endsWith('@student.school.edu') ? CheckCircle : UserCheck,
      change: user?.email?.endsWith('@student.school.edu') ? "View attendance history" : "71% attendance rate",
      color: "text-accent"
    },
    {
      title: user?.email?.endsWith('@student.school.edu') ? "My Schedule" : "Active Sessions",
      value: isLoading ? "-" : userStats.activeSessions.toString(),
      icon: user?.email?.endsWith('@student.school.edu') ? CalendarClock : Clock,
      change: user?.email?.endsWith('@student.school.edu') ? "View upcoming classes" : "3 events, 12 classes",
      color: "text-primary"
    },
    {
      title: user?.email?.endsWith('@student.school.edu') ? "My Tasks" : "Pending Actions",
      value: isLoading ? "-" : userStats.pendingActions.toString(),
      icon: user?.email?.endsWith('@student.school.edu') ? FileText : AlertCircle,
      change: user?.email?.endsWith('@student.school.edu') ? "View your tasks" : "5 approvals, 3 requests",
      color: "text-education-orange"
    }
  ];

  const upcomingEvents = [
    { 
      title: user?.email?.endsWith('@student.school.edu') ? "Math 101 - Calculus" : "Faculty Meeting", 
      date: "Today, " + (user?.email?.endsWith('@student.school.edu') ? "10:00 AM" : "2:00 PM"), 
      location: user?.email?.endsWith('@student.school.edu') ? "Room 205" : "Room 101",
      type: user?.email?.endsWith('@student.school.edu') ? "class" : "meeting"
    },
    { 
      title: user?.email?.endsWith('@student.school.edu') ? "Computer Science Lab" : "Midterm Exams", 
      date: user?.email?.endsWith('@student.school.edu') ? "Tomorrow, 1:30 PM" : "Aug 15-20, 2025", 
      location: user?.email?.endsWith('@student.school.edu') ? "Computer Lab 3" : "Various Rooms",
      type: user?.email?.endsWith('@student.school.edu') ? "lab" : "exam"
    },
    { 
      title: user?.email?.endsWith('@student.school.edu') ? "Study Group Session" : "Sports Festival", 
      date: user?.email?.endsWith('@student.school.edu') ? "Aug 14, 4:00 PM" : "Aug 25, 2025", 
      location: user?.email?.endsWith('@student.school.edu') ? "Library" : "School Grounds",
      type: user?.email?.endsWith('@student.school.edu') ? "study" : "event"
    },
  ];

  const recentSessions = [
    { 
      name: user?.email?.endsWith('@student.school.edu') ? "Your Recent Class" : "Computer Science 101", 
      program: user?.email?.endsWith('@student.school.edu') ? "Your Program" : "Computer Science", 
      students: user?.email?.endsWith('@student.school.edu') ? 1 : 45, 
      status: user?.email?.endsWith('@student.school.edu') ? "Completed" : "Active", 
      time: "9:00 AM",
      progress: user?.email?.endsWith('@student.school.edu') ? 100 : 75
    },
    { 
      name: user?.email?.endsWith('@student.school.edu') ? "Next Class" : "Biology Lab", 
      program: user?.email?.endsWith('@student.school.edu') ? "Your Program" : "Science", 
      students: user?.email?.endsWith('@student.school.edu') ? 1 : 32, 
      status: user?.email?.endsWith('@student.school.edu') ? "Upcoming" : "Completed", 
      time: "10:30 AM",
      progress: user?.email?.endsWith('@student.school.edu') ? 0 : 100
    },
    { 
      name: user?.email?.endsWith('@student.school.edu') ? "Study Session" : "Math Workshop", 
      program: user?.email?.endsWith('@student.school.edu') ? "Self-Study" : "Mathematics", 
      students: user?.email?.endsWith('@student.school.edu') ? 1 : 28, 
      status: user?.email?.endsWith('@student.school.edu') ? "In Progress" : "Scheduled", 
      time: "3:30 PM",
      progress: user?.email?.endsWith('@student.school.edu') ? 50 : 0
    }
  ];

  // Show loading skeleton if data is still loading
  if (loading || isLoading) {
    return (
      <div className="space-y-3 pt-4 px-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg lg:col-span-2" />
        </div>
      </div>
    );
  }

  const quickStats = [
    { label: "This Week's Attendance", value: "89%", change: "+2% from last week" },
    { label: "Classes Completed", value: "28/35", change: "80% of weekly goal" },
    { label: "Next Session", value: "Math 101", time: "in 1h 15m" },
  ];

  return (
    <div className="space-y-3 pt-4">
      {/* Enhanced Header with Date and Time */}
      <div className="px-3">
        <div className="bg-gradient-to-r from-[hsl(214,84%,56%)] to-[hsl(214,100%,78%)] rounded-lg shadow-md overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{greeting}{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h1>
                  <div className="text-white/90 text-sm bg-white/10 px-2 py-1 rounded-md">
                    {currentTime}
                  </div>
                </div>
                <p className="text-white/90 mt-1">
                  {formattedDate}
                </p>
                <p className="text-white/80 text-sm mt-2">
                  {user?.email?.endsWith('@student.school.edu') 
                    ? 'Student Dashboard • Fall 2025 • Week 3' 
                    : 'Faculty Dashboard • Academic Year 2025-2026 • 1st Semester'}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {user?.email?.endsWith('@student.school.edu') ? 'My Schedule' : 'View Calendar'}
                </Button>
                {user?.email?.endsWith('@student.school.edu') && (
                  <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-3 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-education-navy mt-1">
                        {stat.value}
                      </p>
                      <p className={`text-xs mt-1 ${stat.color} flex items-center gap-1`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Upcoming Events */}
          <Card className="bg-gradient-card border-0 shadow-card lg:col-span-1">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-education-navy text-sm font-semibold">
                <CalendarClock className="w-4 h-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-sm hover:bg-background/50 transition-colors">
                  <div className={`mt-0.5 p-1.5 rounded ${
                    event.type === 'exam' ? 'bg-red-100 text-red-600' :
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {event.type === 'exam' ? <BookOpen className="w-3.5 h-3.5" /> :
                     event.type === 'meeting' ? <Users className="w-3.5 h-3.5" /> :
                     <CalendarCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-education-navy truncate">{event.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <Clock3 className="w-3 h-3 mr-1" />
                      <span>{event.date}</span>
                      <span className="mx-1">•</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-education-blue hover:text-education-blue/80">
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="bg-gradient-card border-0 shadow-card lg:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center justify-between text-education-navy text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Today's Sessions
                </div>
                <span className="text-xs font-normal text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex flex-col p-3 rounded-sm bg-background/50 border border-border/50 hover:border-border/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm text-education-navy">{session.name}</h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        <span>{session.program}</span>
                        <span className="mx-1.5">•</span>
                        <Users className="w-3 h-3 mr-1" />
                        <span>{session.students} students</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        session.status === 'Active' ? 'bg-accent/10 text-accent' :
                        session.status === 'Completed' ? 'bg-education-green/10 text-education-green' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {session.status}
                      </span>
                      <p className="text-xs font-medium text-education-navy mt-1">{session.time}</p>
                    </div>
                  </div>
                  {session.progress > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${session.status === 'Completed' ? 'bg-education-green' : 'bg-accent'}`} 
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {session.progress}% {session.status === 'Active' ? 'in progress' : 'completed'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-education-navy mt-1">{stat.value}</p>
                    <p className="text-xs text-education-blue mt-1 flex items-center">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/5">
                    {stat.label.includes('Attendance') && <UserCheck className="w-5 h-5 text-primary" />}
                    {stat.label.includes('Completed') && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {stat.label.includes('Next Session') && <Clock3 className="w-5 h-5 text-education-orange" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-education-navy text-sm font-semibold">
              <Lightbulb className="w-4 h-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <Link to="/take-attendance" className="group">
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm hover:bg-transparent border-border/50 group-hover:border-primary/30">
                  <UserCheck className="w-4 h-4 transition-colors group-hover:text-primary" />
                  <span className="transition-colors group-hover:text-primary">
                    Take Attendance
                  </span>
                </Button>
              </Link>
              <Link to="/schedule" className="group">
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm hover:bg-transparent border-border/50 group-hover:border-primary/30">
                  <Calendar className="w-4 h-4 transition-colors group-hover:text-primary" />
                  <span className="transition-colors group-hover:text-primary">
                    View Schedule
                  </span>
                </Button>
              </Link>
              <Link to="/students" className="group">
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm hover:bg-transparent border-border/50 group-hover:border-primary/30">
                  <Users className="w-4 h-4 transition-colors group-hover:text-primary" />
                  <span className="transition-colors group-hover:text-primary">
                    Manage Students
                  </span>
                </Button>
              </Link>
              <Link to="/records" className="group">
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm hover:bg-transparent border-border/50 group-hover:border-primary/30">
                  <FileText className="w-4 h-4 transition-colors group-hover:text-primary" />
                  <span className="transition-colors group-hover:text-primary">
                    View Records
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;