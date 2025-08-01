import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const attendanceData = [
  { date: "Mon", attendance: 85, target: 90 },
  { date: "Tue", attendance: 78, target: 90 },
  { date: "Wed", attendance: 92, target: 90 },
  { date: "Thu", attendance: 88, target: 90 },
  { date: "Fri", attendance: 75, target: 90 },
  { date: "Sat", attendance: 95, target: 90 },
  { date: "Sun", attendance: 82, target: 90 }
];

const departmentData = [
  { department: "Computer Science", students: 245, color: "hsl(var(--education-blue))" },
  { department: "Mathematics", students: 189, color: "hsl(var(--primary))" },
  { department: "Physics", students: 156, color: "hsl(var(--accent))" },
  { department: "Biology", students: 203, color: "hsl(var(--education-green))" },
  { department: "Chemistry", students: 167, color: "hsl(var(--education-navy))" }
];

const weeklyTrends = [
  { week: "Week 1", classes: 45, events: 8, activities: 12 },
  { week: "Week 2", classes: 52, events: 6, activities: 15 },
  { week: "Week 3", classes: 48, events: 10, activities: 18 },
  { week: "Week 4", classes: 55, events: 7, activities: 14 }
];

export function AnalyticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance Trends */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-education-navy">Weekly Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-education-navy">Students by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="department" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar 
                dataKey="students" 
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session Types Pie Chart */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-education-navy">Session Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Classes", value: 65, color: "hsl(var(--primary))" },
                  { name: "Events", value: 20, color: "hsl(var(--accent))" },
                  { name: "Activities", value: 15, color: "hsl(var(--education-green))" }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  { name: "Classes", value: 65, color: "hsl(var(--primary))" },
                  { name: "Events", value: 20, color: "hsl(var(--accent))" },
                  { name: "Activities", value: 15, color: "hsl(var(--education-green))" }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Activity Trends */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-education-navy">Monthly Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="classes" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="events" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="activities" fill="hsl(var(--education-green))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}