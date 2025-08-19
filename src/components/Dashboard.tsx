import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, BookOpen, Clock, TrendingUp, CheckCircle2, Calendar, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchTotalStudents();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTotalStudents = async () => {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setTotalStudents(count || 0);
    } catch (error) {
      console.error('Error fetching total students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCalendar = () => {
    navigate('/schedule');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getDashboardTitle = () => {
    const role = userProfile?.role || 'user';
    const roleLabels = {
      admin: 'Admin',
      instructor: 'Instructor',
      user: 'User'
    };
    return `${roleLabels[role] || 'User'} Dashboard`;
  };

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="flex-1 space-y-4 p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-education-navy">{getDashboardTitle()}</h2>
          <p className="text-sm text-muted-foreground">
            {getGreeting()}, {getUserDisplayName()}! Here's your attendance overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleViewCalendar}
            className="bg-gradient-primary shadow-glow h-9 px-4"
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-education-navy">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold text-education-navy">
              {loading ? '...' : totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enrolled students
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-education-navy">Today's Sessions</CardTitle>
            <CalendarDays className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold text-education-navy">8</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-education-navy">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-education-green" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold text-education-navy">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0 shadow-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-education-navy">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-2xl font-bold text-education-navy">24</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all programs
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-gradient-card border-0 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-education-navy">Recent Activity</CardTitle>
            <CardDescription>
              Latest attendance activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <CheckCircle2 className="mr-3 h-4 w-4 text-green-500" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-none">
                    CS 101 - Introduction to Programming
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Attendance taken for 45 students
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">2 min ago</div>
              </div>
              
              <div className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Clock className="mr-3 h-4 w-4 text-orange-500" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-none">
                    MATH 201 - Calculus II
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Session starting in 15 minutes
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">upcoming</div>
              </div>
              
              <div className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <BarChart3 className="mr-3 h-4 w-4 text-blue-500" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-none">
                    Weekly Report Generated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Attendance summary for Nov 11-17
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-gradient-card border-0 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-education-navy">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start h-9 hover:bg-muted hover:text-foreground transition-colors"
                variant="outline"
                onClick={() => navigate('/take-attendance')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
              
              <Button 
                className="w-full justify-start h-9 hover:bg-muted hover:text-foreground transition-colors"
                variant="outline"
                onClick={() => navigate('/students')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
              
              <Button 
                className="w-full justify-start h-9 hover:bg-muted hover:text-foreground transition-colors"
                variant="outline"
                onClick={() => navigate('/schedule')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                View Schedule
              </Button>
              
              <Button 
                className="w-full justify-start h-9 hover:bg-muted hover:text-foreground transition-colors"
                variant="outline"
                onClick={() => navigate('/records')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
