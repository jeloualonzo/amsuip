import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  User, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  List, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Key,
  Clock,
  Calendar,
  UserCog,
  Activity,
  Lock,
  Mail
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Types
type AccountStatus = 'active' | 'inactive' | 'pending' | 'suspended';
type UserRole = 'Admin' | 'Professor' | 'Staff' | 'Assistant';

interface Account {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  lastLogin: string;
  contactNo: string;
  department?: string;
  joinDate: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  lastActivity: string;
  loginAttempts: number;
  permissions: string[];
}

// Mock Data Generators
const generateMockAccounts = (count: number): Account[] => {
  const roles: UserRole[] = ['Admin', 'Professor', 'Staff', 'Assistant'];
  const statuses: AccountStatus[] = ['active', 'inactive', 'pending', 'suspended'];
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Administration'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 2,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)] as AccountStatus,
    lastLogin: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
    contactNo: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    department: departments[Math.floor(Math.random() * departments.length)],
    joinDate: subDays(new Date(), Math.floor(Math.random() * 365)).toISOString(),
    avatar: `https://i.pravatar.cc/150?u=${i + 1}`,
    twoFactorEnabled: Math.random() > 0.5,
    lastActivity: subDays(new Date(), Math.floor(Math.random() * 5)).toISOString(),
    loginAttempts: Math.floor(Math.random() * 3),
    permissions: ['view', 'edit'].slice(0, Math.floor(Math.random() * 2) + 1)
  }));
};

// Role Badge Component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleStyles = {
    Admin: { bg: 'bg-blue-100', text: 'text-blue-800' },
    Professor: { bg: 'bg-purple-100', text: 'text-purple-800' },
    Staff: { bg: 'bg-amber-100', text: 'text-amber-800' },
    Assistant: { bg: 'bg-green-100', text: 'text-green-800' }
  };

  return (
    <Badge className={`${roleStyles[role].bg} ${roleStyles[role].text} px-2 py-0.5`}>
      {role}
    </Badge>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: AccountStatus }) => {
  const statusStyles = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: <UserCheck className="w-3 h-3 mr-1" /> },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <UserX className="w-3 h-3 mr-1" /> },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> },
    suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> }
  };

  return (
    <Badge className={`${statusStyles[status].bg} ${statusStyles[status].text} px-2 py-0.5`}>
      <div className="flex items-center">
        {statusStyles[status].icon}
        <span className="capitalize">{status}</span>
      </div>
    </Badge>
  );
};

// Main Component
const Accounts = () => {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const { user } = useAuth();
  
  // Mock data
  const [accounts, setAccounts] = useState<Account[]>(() => generateMockAccounts(25));
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  
  // Filter accounts based on search, role, and status
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || account.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' ? true : 
                         (selectedStatus === 'active' ? account.status === 'active' : 
                         account.status !== 'active');
    
    return matchesSearch && matchesRole && matchesStatus && 
           (showInactive ? true : account.status !== 'inactive');
  });

  // Pagination
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedAccounts.map(account => account.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserSelect = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleStatusToggle = (userId: number, newStatus: AccountStatus) => {
    setAccounts(accounts.map(account => 
      account.id === userId ? { ...account, status: newStatus } : account
    ));
    
    toast({
      title: "Status updated",
      description: `User status has been ${newStatus}.`,
    });
  };

  const handleBulkAction = (action: string) => {
    // In a real app, this would make an API call
    toast({
      title: `${action} action`,
      description: `Performed ${action} on ${selectedUsers.length} users.`,
    });
    setSelectedUsers([]);
  };

  // Render function for list view
  const renderListView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedUsers.length === paginatedAccounts.length && paginatedAccounts.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAccounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedUsers.includes(account.id)}
                  onCheckedChange={(checked) => handleUserSelect(account.id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={account.avatar} />
                    <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">{account.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell><RoleBadge role={account.role} /></TableCell>
              <TableCell>{account.department || 'N/A'}</TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(account.lastLogin), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(account.lastLogin), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={account.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={account.status === 'active' ? 'text-red-600' : 'text-green-600'}
                      onClick={() => handleStatusToggle(account.id, account.status === 'active' ? 'inactive' : 'active')}
                    >
                      {account.status === 'active' ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );



  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and their access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowUserDialog(true)}
            >
              <User className="h-4 w-4" />
              Me
            </Button>
            <Button className="bg-gradient-primary shadow-glow h-9">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>

          </div>

          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-blue-800">
                  {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
                </p>
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-inactive" 
                    checked={showInactive} 
                    onCheckedChange={setShowInactive} 
                  />
                  <label
                    htmlFor="show-inactive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Inactive
                  </label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredAccounts.length} {filteredAccounts.length === 1 ? 'user' : 'users'} found
              </p>
            </div>

            {renderListView()}

            {filteredAccounts.length > 0 && (
              <div className="flex items-center justify-between px-2">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredAccounts.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAccounts.length}</span> users
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              <span>My Account</span>
            </DialogTitle>
            <DialogDescription>
              View and manage your account details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Email:</span>
                <span className="ml-auto font-mono text-sm">{user?.email || 'No email found'}</span>
              </div>
              
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    Change Password
                  </Button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value="••••••••" 
                  readOnly 
                  className="font-mono"
                />
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  Last login: {user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy h:mm a') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Profile updated",
                  description: "Your account information has been updated.",
                });
                setShowUserDialog(false);
              }}
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Accounts;
