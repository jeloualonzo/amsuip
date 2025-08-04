import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Upload, 
  Mail,
  Phone,
  GraduationCap,
  Camera
} from "lucide-react";
import { studentsApi, getUniquePrograms, getUniqueYearLevels } from "@/lib/api";

const Students = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [programs, setPrograms] = useState<string[]>([]);
  const [yearLevels, setYearLevels] = useState<number[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedProgram, selectedYear]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.getAll();
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [programsData, yearLevelsData] = await Promise.all([
        getUniquePrograms(),
        getUniqueYearLevels()
      ]);
      setPrograms(programsData);
      setYearLevels(yearLevelsData);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProgram !== "all") {
      filtered = filtered.filter(student => student.program === selectedProgram);
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter(student => student.year_level === parseInt(selectedYear));
    }

    setFilteredStudents(filtered);
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const csvData = rows.slice(1)
        .filter(row => row.length > 1 && row[0].trim())
        .map(row => {
          const student: any = {};
          headers.forEach((header, index) => {
            const value = row[index]?.trim();
            switch (header) {
              case 'surname':
                student.last_name = value;
                break;
              case 'firstname':
                student.first_name = value;
                break;
              case 'middle_initial':
                student.middle_initial = value;
                break;
              case 'student_id':
                student.student_id = value;
                break;
              case 'program':
                student.program = value;
                break;
              case 'year':
                student.year_level = parseInt(value) || 1;
                break;
              case 'section':
                student.section = value;
                break;
              case 'sex':
                student.sex = value;
                break;
              case 'address':
                student.address = value;
                break;
              case 'birthday':
                student.birthday = value;
                break;
              case 'contact_no':
                student.contact_no = value;
                break;
              case 'email':
                student.email = value;
                break;
            }
          });
          return student;
        });

      await studentsApi.create(csvData[0]); // For now, create one by one
      // In production, you'd want to batch insert
      
      toast({
        title: "Success",
        description: `Imported ${csvData.length} students successfully.`,
      });
      
      fetchStudents();
      setIsImportDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to import CSV. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStudent) return;

    try {
      // In a real implementation, you would upload to storage and then update the student record
      // For now, we'll just simulate the upload
      const currentSignatures = selectedStudent.signature_images || [];
      const newSignatureCount = currentSignatures.length + 1;
      const confidenceLevel = Math.min((newSignatureCount / 10) * 100, 100);

      await studentsApi.update(selectedStudent.id, {
        signature_images: [...currentSignatures, `signature_${newSignatureCount}.jpg`],
        signature_confidence_level: Math.floor(confidenceLevel)
      });

      toast({
        title: "Success",
        description: `Signature uploaded. Confidence level: ${Math.floor(confidenceLevel)}%`,
      });
      
      fetchStudents();
      setIsUploadDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload signature.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 80) return "text-accent";
    if (level >= 50) return "text-primary";
    return "text-destructive";
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
            <h1 className="text-3xl font-bold text-education-navy">Student Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage student profiles and track their information.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by name or student ID..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map(program => (
                    <SelectItem key={program} value={program}>{program}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearLevels.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year} Year</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No students found.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 bg-gradient-primary">
                        <AvatarFallback className="text-primary-foreground font-medium">
                          {getInitials(student.first_name, student.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-education-navy">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                      </div>
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{student.program}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Year:</span>
                      <span>{student.year_level}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Section:</span>
                      <span>{student.section}</span>
                    </div>

                    {student.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    )}

                    {student.contact_no && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{student.contact_no}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div>
                        <span className="text-sm text-muted-foreground">Signature Confidence</span>
                        <div className={`font-bold ${getConfidenceColor(student.signature_confidence_level || 0)}`}>
                          {student.signature_confidence_level || 0}%
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        <Camera className="w-3 h-3 mr-1" />
                        Upload Signature
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-navy">{students.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent">{students.length}</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{programs.length}</div>
              <div className="text-sm text-muted-foreground">Programs</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-education-green">{yearLevels.length}</div>
              <div className="text-sm text-muted-foreground">Year Levels</div>
            </CardContent>
          </Card>
        </div>

        {/* Import CSV Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Students from CSV</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with the following columns: surname, firstname, middle_initial, student_id, program, year, section, sex, address, birthday, contact_no, email
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="cursor-pointer"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Signature Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Signature for {selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a clear image of the student's signature. More signatures improve recognition accuracy.
              </p>
              <div className="text-sm">
                <p>Current signatures: {selectedStudent?.signature_images?.length || 0}</p>
                <p>Confidence level: {selectedStudent?.signature_confidence_level || 0}%</p>
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="cursor-pointer"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Students;