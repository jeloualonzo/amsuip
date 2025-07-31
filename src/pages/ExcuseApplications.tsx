import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Upload, Eye, Check, X, Trash2, Plus } from "lucide-react";
import Layout from "@/components/Layout";

interface ExcuseApplication {
  id: string;
  studentName: string;
  courseYearSection?: string;
  dateOfAbsence: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  uploadedImage?: string;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

const ExcuseApplications = () => {
  const [applications, setApplications] = useState<ExcuseApplication[]>([
    {
      id: "1",
      studentName: "John Doe",
      courseYearSection: "BS-IT 3A",
      dateOfAbsence: "2024-01-15",
      reason: "Medical appointment",
      status: "Pending",
      submittedDate: "2024-01-16",
    },
    {
      id: "2",
      studentName: "Jane Smith",
      courseYearSection: "BS-CS 2B",
      dateOfAbsence: "2024-01-14",
      reason: "Family emergency",
      status: "Approved",
      submittedDate: "2024-01-15",
      approvedBy: "Admin",
      approvedDate: "2024-01-16",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    studentName: "",
    courseYearSection: "",
    dateOfAbsence: "",
    reason: "",
    uploadedImage: "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, uploadedImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.dateOfAbsence || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newApplication: ExcuseApplication = {
      id: Date.now().toString(),
      studentName: formData.studentName,
      courseYearSection: formData.courseYearSection,
      dateOfAbsence: formData.dateOfAbsence,
      reason: formData.reason,
      status: "Pending",
      uploadedImage: formData.uploadedImage,
      submittedDate: new Date().toISOString().split('T')[0],
    };

    setApplications([...applications, newApplication]);
    setFormData({
      studentName: "",
      courseYearSection: "",
      dateOfAbsence: "",
      reason: "",
      uploadedImage: "",
    });
    setIsFormOpen(false);
    toast.success("Excuse application submitted successfully!");
  };

  const updateStatus = (id: string, status: "Approved" | "Rejected") => {
    setApplications(applications.map(app => 
      app.id === id 
        ? { 
            ...app, 
            status, 
            approvedBy: "Admin",
            approvedDate: new Date().toISOString().split('T')[0]
          }
        : app
    ));
    toast.success(`Application ${status.toLowerCase()} successfully!`);
  };

  const deleteApplication = (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
    toast.success("Application deleted successfully!");
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.dateOfAbsence.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ExcuseApplication["status"]) => {
    const variants = {
      Pending: "secondary",
      Approved: "default",
      Rejected: "destructive",
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-education-navy">Excuse Applications</h1>
            <p className="text-muted-foreground mt-1">
              Manage student excuse letters and requests
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Upload Excuse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Excuse Application</DialogTitle>
                <DialogDescription>
                  Add a new excuse letter for student absence.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Enter student name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseYearSection">Course/Year/Section</Label>
                  <Input
                    id="courseYearSection"
                    value={formData.courseYearSection}
                    onChange={(e) => setFormData({ ...formData, courseYearSection: e.target.value })}
                    placeholder="e.g., BS-IT 3A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfAbsence">Date of Absence *</Label>
                  <Input
                    id="dateOfAbsence"
                    type="date"
                    value={formData.dateOfAbsence}
                    onChange={(e) => setFormData({ ...formData, dateOfAbsence: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason for absence"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Upload Letter Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.uploadedImage && (
                    <div className="mt-2">
                      <img 
                        src={formData.uploadedImage} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-education-navy">Filter Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-education-navy">Excuse Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} application(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course/Year/Section</TableHead>
                  <TableHead>Date of Absence</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.studentName}</TableCell>
                    <TableCell>{application.courseYearSection || "N/A"}</TableCell>
                    <TableCell>{application.dateOfAbsence}</TableCell>
                    <TableCell className="max-w-xs truncate">{application.reason}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      {application.uploadedImage ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImage(application.uploadedImage!)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {application.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(application.id, "Approved")}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(application.id, "Rejected")}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApplication(application.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Excuse Letter Image</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="flex justify-center">
                <img 
                  src={selectedImage} 
                  alt="Excuse letter" 
                  className="max-w-full max-h-96 object-contain rounded border"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ExcuseApplications;