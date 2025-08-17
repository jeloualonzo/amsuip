import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";

type Excuse = {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
};

const ExcuseApplicationContent = () => {
  // Mock data for demonstration
  const excuses: Excuse[] = [
    {
      id: '1',
      studentName: 'John Doe',
      studentId: '2023-001',
      date: '2023-11-15',
      reason: 'Medical appointment with doctor\'s note provided.',
      status: 'pending',
      submittedAt: '2023-11-14T10:30:00Z'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentId: '2023-042',
      date: '2023-11-16',
      reason: 'Family emergency - out of town',
      status: 'approved',
      submittedAt: '2023-11-13T15:45:00Z'
    },
    {
      id: '3',
      studentName: 'Alex Johnson',
      studentId: '2023-123',
      date: '2023-11-17',
      reason: 'University sports competition',
      status: 'rejected',
      submittedAt: '2023-11-12T09:15:00Z',
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Excuse Applications</h1>
          <p className="text-muted-foreground">
            Review and manage student excuse applications
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-glow h-9">
          <FileText className="w-4 h-4 mr-2" />
          New Excuse Application
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {excuses.length > 0 ? (
            <div className="space-y-4">
              {excuses.map((excuse) => (
                <div key={excuse.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{excuse.studentName} <span className="text-muted-foreground text-sm">({excuse.studentId})</span></h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        For: {new Date(excuse.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="mt-2">{excuse.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(excuse.status)}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No pending applications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                All caught up! No excuse applications require review.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ExcuseApplication = () => {
  return (
    <Layout>
      <ExcuseApplicationContent />
    </Layout>
  );
};

export default ExcuseApplication;
