import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  Users,
  BookOpen,
  Star
} from "lucide-react";

const Records = () => {
  const mockRecords = [
    {
      id: 1,
      title: "Computer Science 101",
      type: "class",
      department: "Computer Science",
      date: "2024-01-29",
      timeIn: "09:00",
      timeOut: "10:30",
      totalStudents: 45,
      present: 42,
      absent: 3,
      attendanceRate: 93
    },
    {
      id: 2,
      title: "Annual Science Fair",
      type: "event",
      department: "Science",
      date: "2024-01-28",
      timeIn: "14:00",
      timeOut: "17:00",
      totalStudents: 156,
      present: 142,
      absent: 14,
      attendanceRate: 91
    },
    {
      id: 3,
      title: "Leadership Workshop",
      type: "other",
      department: "Administration",
      date: "2024-01-27",
      timeIn: "10:00",
      timeOut: "12:00",
      totalStudents: 28,
      present: 25,
      absent: 3,
      attendanceRate: 89
    },
    {
      id: 4,
      title: "Mathematics 201",
      type: "class",
      department: "Mathematics",
      date: "2024-01-26",
      timeIn: "11:00",
      timeOut: "12:30",
      totalStudents: 38,
      present: 35,
      absent: 3,
      attendanceRate: 92
    }
  ];

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

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-accent";
    if (rate >= 80) return "text-primary";
    return "text-destructive";
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-education-navy">Attendance Records</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all attendance sessions and reports.
            </p>
          </div>
          <Button className="bg-gradient-primary shadow-glow">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search records..." 
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="class">Classes</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="other">Activities</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {mockRecords.map((record) => (
            <Card key={record.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-primary/10">
                      {getTypeIcon(record.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-education-navy">{record.title}</h3>
                        {getTypeBadge(record.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.department} • {record.date} • {record.timeIn} - {record.timeOut}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Total Students
                      </div>
                      <div className="text-lg font-bold text-education-navy">{record.totalStudents}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Present</div>
                      <div className="text-lg font-bold text-accent">{record.present}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Absent</div>
                      <div className="text-lg font-bold text-destructive">{record.absent}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Rate</div>
                      <div className={`text-lg font-bold ${getAttendanceColor(record.attendanceRate)}`}>
                        {record.attendanceRate}%
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-navy">156</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent">91.2%</div>
              <div className="text-sm text-muted-foreground">Average Attendance</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">1,248</div>
              <div className="text-sm text-muted-foreground">Students Tracked</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Records;