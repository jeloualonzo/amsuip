import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Download, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  GraduationCap
} from "lucide-react";

const Students = () => {
  const mockStudents = [
    {
      id: "2023001",
      name: "Alice Johnson",
      email: "alice.johnson@school.edu",
      phone: "+1234567890",
      department: "Computer Science",
      year: "3rd",
      section: "A",
      status: "Active",
      attendanceRate: 95
    },
    {
      id: "2023002", 
      name: "Bob Smith",
      email: "bob.smith@school.edu",
      phone: "+1234567891",
      department: "Mathematics",
      year: "2nd",
      section: "B",
      status: "Active",
      attendanceRate: 88
    },
    {
      id: "2023003",
      name: "Carol Davis",
      email: "carol.davis@school.edu", 
      phone: "+1234567892",
      department: "Science",
      year: "4th",
      section: "A",
      status: "Active",
      attendanceRate: 92
    },
    {
      id: "2023004",
      name: "David Wilson",
      email: "david.wilson@school.edu",
      phone: "+1234567893", 
      department: "English",
      year: "1st",
      section: "C",
      status: "Inactive",
      attendanceRate: 76
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-accent";
    if (rate >= 80) return "text-primary";
    return "text-destructive";
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" 
      ? <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
      : <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-education-navy">Student Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage student profiles and track their information.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-10"
                />
              </div>
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
                  <SelectValue placeholder="Year Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStudents.map((student) => (
            <Card key={student.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-primary">
                      <AvatarFallback className="text-primary-foreground font-medium">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-education-navy">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{student.department}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Year:</span>
                    <span>{student.year}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Section:</span>
                    <span>{student.section}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{student.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <div className={`font-bold ${getAttendanceColor(student.attendanceRate)}`}>
                        {student.attendanceRate}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-navy">1,248</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent">1,195</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">89.2%</div>
              <div className="text-sm text-muted-foreground">Avg Attendance</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-green">8</div>
              <div className="text-sm text-muted-foreground">Departments</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Students;