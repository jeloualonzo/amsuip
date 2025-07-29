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

const Dashboard = () => {
  const stats = [
    {
      title: "Total Students",
      value: "1,248",
      icon: Users,
      change: "+12% from last month",
      color: "text-education-blue"
    },
    {
      title: "Today's Attendance",
      value: "892",
      icon: UserCheck,
      change: "71% attendance rate",
      color: "text-accent"
    },
    {
      title: "Active Sessions",
      value: "15",
      icon: Clock,
      change: "3 events, 12 classes",
      color: "text-primary"
    },
    {
      title: "Completed Today",
      value: "28",
      icon: CheckCircle,
      change: "18 classes, 10 activities",
      color: "text-education-green"
    }
  ];

  const recentSessions = [
    { name: "Computer Science 101", department: "CS", students: 45, status: "Active", time: "9:00 AM" },
    { name: "Biology Lab", department: "Science", students: 32, status: "Completed", time: "10:30 AM" },
    { name: "Annual Sports Meet", department: "Sports", students: 156, status: "Active", time: "2:00 PM" },
    { name: "Math Workshop", department: "Math", students: 28, status: "Scheduled", time: "3:30 PM" }
  ];

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
        <Link to="/attendance">
          <Button className="bg-gradient-primary shadow-glow hover:shadow-elegant transition-all duration-300">
            <UserCheck className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                <div>
                  <h4 className="font-medium text-education-navy">{session.name}</h4>
                  <p className="text-sm text-muted-foreground">{session.department} • {session.students} students</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'Active' ? 'bg-accent/10 text-accent' :
                    session.status === 'Completed' ? 'bg-education-green/10 text-education-green' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {session.status}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">{session.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-education-navy">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/attendance">
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