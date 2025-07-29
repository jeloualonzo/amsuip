import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Users, BookOpen, Calendar, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AttendanceType = "class" | "event" | "other";

const AttendanceForm = () => {
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("class");
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    year: "",
    section: "",
    date: "",
    timeIn: "",
    timeOut: "",
    description: "",
    venue: "",
    capacity: ""
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Attendance Session Created",
      description: `${formData.title} session has been created successfully.`,
    });
    
    // Reset form
    setFormData({
      title: "",
      department: "",
      year: "",
      section: "",
      date: "",
      timeIn: "",
      timeOut: "",
      description: "",
      venue: "",
      capacity: ""
    });
  };

  const getTypeIcon = (type: AttendanceType) => {
    switch (type) {
      case "class": return <BookOpen className="w-5 h-5" />;
      case "event": return <Calendar className="w-5 h-5" />;
      case "other": return <Star className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: AttendanceType) => {
    switch (type) {
      case "class": return "bg-gradient-primary";
      case "event": return "bg-gradient-accent";
      case "other": return "bg-education-navy";
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-education-navy">Create Attendance Session</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new attendance tracking session for students.
        </p>
      </div>

      {/* Type Selection */}
      <Card className="bg-gradient-card border-0 shadow-card mb-8">
        <CardHeader>
          <CardTitle className="text-education-navy">Select Attendance Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "class" as AttendanceType, label: "Class Session", description: "Regular classroom attendance" },
              { type: "event" as AttendanceType, label: "School Event", description: "Assemblies, ceremonies, programs" },
              { type: "other" as AttendanceType, label: "Other Activity", description: "Workshops, field trips, meetings" }
            ].map((option) => (
              <Button
                key={option.type}
                variant={attendanceType === option.type ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-3 ${
                  attendanceType === option.type 
                    ? `${getTypeColor(option.type)} text-white shadow-glow` 
                    : "hover:bg-gradient-primary/5"
                }`}
                onClick={() => setAttendanceType(option.type)}
              >
                {getTypeIcon(option.type)}
                <div className="text-center">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-80">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-education-navy">
            {getTypeIcon(attendanceType)}
            {attendanceType === "class" ? "Class" : attendanceType === "event" ? "Event" : "Activity"} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {attendanceType === "class" ? "Subject/Course Name" : 
                   attendanceType === "event" ? "Event Name" : "Activity Title"} *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder={attendanceType === "class" ? "e.g., Mathematics 101" : 
                             attendanceType === "event" ? "e.g., Annual Science Fair" : "e.g., Leadership Workshop"}
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select onValueChange={(value) => setFormData({...formData, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Level */}
              {(attendanceType === "class" || attendanceType === "other") && (
                <div className="space-y-2">
                  <Label htmlFor="year">Year Level</Label>
                  <Select onValueChange={(value) => setFormData({...formData, year: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                      <SelectItem value="all">All Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Section */}
              {attendanceType === "class" && (
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    placeholder="e.g., A, B, C"
                  />
                </div>
              )}

              {/* Venue */}
              {attendanceType !== "class" && (
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    placeholder="e.g., Main Auditorium, Gymnasium"
                  />
                </div>
              )}

              {/* Expected Capacity */}
              {attendanceType === "event" && (
                <div className="space-y-2">
                  <Label htmlFor="capacity">Expected Participants</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g., 150"
                  />
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              {/* Time In */}
              <div className="space-y-2">
                <Label htmlFor="timeIn">Start Time *</Label>
                <Input
                  id="timeIn"
                  type="time"
                  value={formData.timeIn}
                  onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
                  required
                />
              </div>

              {/* Time Out */}
              <div className="space-y-2">
                <Label htmlFor="timeOut">End Time</Label>
                <Input
                  id="timeOut"
                  type="time"
                  value={formData.timeOut}
                  onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {attendanceType === "class" ? "Course Description" : 
                 attendanceType === "event" ? "Event Description" : "Activity Description"}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={`Brief description of the ${attendanceType}...`}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className={`${getTypeColor(attendanceType)} shadow-glow hover:shadow-elegant transition-all duration-300 flex-1`}
              >
                <Users className="w-4 h-4 mr-2" />
                Create Session & Start Tracking
              </Button>
              <Button type="button" variant="outline" className="px-8">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceForm;