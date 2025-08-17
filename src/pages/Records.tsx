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
      program: "Computer Science",
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
      program: "Science",
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
      program: "Administration",
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
      program: "Mathematics",
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
      <div className="p-3 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-education-navy">Attendance Records</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all attendance sessions and reports
            </p>
          </div>
          <Button size="sm" className="bg-gradient-primary shadow-glow h-9">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-sm">Export Data</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <Input 
                  placeholder="Search records..." 
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="class" className="text-xs">Classes</SelectItem>
                  <SelectItem value="event" className="text-xs">Events</SelectItem>
                  <SelectItem value="other" className="text-xs">Activities</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Programs</SelectItem>
                  <SelectItem value="computer-science" className="text-xs">Computer Science</SelectItem>
                  <SelectItem value="mathematics" className="text-xs">Mathematics</SelectItem>
                  <SelectItem value="science" className="text-xs">Science</SelectItem>
                  <SelectItem value="english" className="text-xs">English</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today" className="text-xs">Today</SelectItem>
                  <SelectItem value="week" className="text-xs">This Week</SelectItem>
                  <SelectItem value="month" className="text-xs">This Month</SelectItem>
                  <SelectItem value="custom" className="text-xs">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-3">
          {mockRecords.map((record) => (
            <Card key={record.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary/10">
                      {getTypeIcon(record.type)}
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h3 className="text-sm font-semibold text-education-navy">{record.title}</h3>
                        {getTypeBadge(record.type)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {record.program} • {record.date} • {record.timeIn} - {record.timeOut}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>Students</span>
                      </div>
                      <div className="text-sm font-bold text-education-navy">{record.totalStudents}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Present</div>
                      <div className="text-sm font-bold text-accent">{record.present}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Absent</div>
                      <div className="text-sm font-bold text-destructive">{record.absent}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Rate</div>
                      <div className={`text-sm font-bold ${getAttendanceColor(record.attendanceRate)}`}>
                        {record.attendanceRate}%
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-education-navy">156</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-accent">91.2%</div>
              <div className="text-xs text-muted-foreground">Average Attendance</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-primary">1,248</div>
              <div className="text-xs text-muted-foreground">Students Tracked</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Records;