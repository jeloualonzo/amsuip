import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CalendarDays, Pencil, Trash2, MoreHorizontal, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import Layout from "@/components/Layout";

// Mock data for academic years
const mockAcademicYears = [
  {
    id: 1,
    name: "2024-2025",
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2025, 3, 30),
    isActive: true,
    semesters: [
      { id: 1, name: "1st Semester", startDate: new Date(2024, 5, 1), endDate: new Date(2024, 9, 31), isActive: true },
      { id: 2, name: "2nd Semester", startDate: new Date(2024, 10, 1), endDate: new Date(2025, 2, 20), isActive: false },
      { id: 3, name: "Summer", startDate: new Date(2025, 3, 1), endDate: new Date(2025, 3, 30), isActive: false },
    ]
  },
  {
    id: 2,
    name: "2023-2024",
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2024, 3, 30),
    isActive: false,
    semesters: [
      { id: 4, name: "1st Semester", startDate: new Date(2023, 5, 1), endDate: new Date(2023, 9, 31), isActive: false },
      { id: 5, name: "2nd Semester", startDate: new Date(2023, 10, 1), endDate: new Date(2024, 2, 20), isActive: false },
      { id: 6, name: "Summer", startDate: new Date(2024, 3, 1), endDate: new Date(2024, 3, 30), isActive: false },
    ]
  },
];

const AcademicYear = () => {
  const [academicYears, setAcademicYears] = useState(mockAcademicYears);
  const [expandedYear, setExpandedYear] = useState<number | null>(1); // Default to first year expanded

  const toggleExpand = (id: number) => {
    setExpandedYear(expandedYear === id ? null : id);
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Academic Years</h2>
          <p className="text-muted-foreground">
            Manage academic years and semesters
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-glow h-9">
          <Plus className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Academic Year List</CardTitle>
              <CardDescription>
                View and manage all academic years and their semesters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {academicYears.map((year) => (
              <div key={year.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleExpand(year.id)}
                >
                  <div className="flex items-center space-x-4">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {year.name}
                        {year.isActive && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(year.startDate)} - {formatDate(year.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Year
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Year
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(year.id);
                      }}
                    >
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          expandedYear === year.id ? 'rotate-180' : ''
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
                
                {expandedYear === year.id && (
                  <div className="border-t p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Semesters</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Semester
                      </Button>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {year.semesters.map((semester) => (
                          <TableRow key={semester.id}>
                            <TableCell>{semester.name}</TableCell>
                            <TableCell>{formatDate(semester.startDate)}</TableCell>
                            <TableCell>{formatDate(semester.endDate)}</TableCell>
                            <TableCell>
                              {semester.isActive ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Active
                                </Badge>
                              ) : new Date() > semester.endDate ? (
                                <Badge variant="outline" className="border-gray-300">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                  Upcoming
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Semester
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Semester
                                  </DropdownMenuItem>
                                  {!semester.isActive && new Date() <= semester.endDate && (
                                    <DropdownMenuItem className="text-green-600">
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Set as Active
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default AcademicYear;
