import Layout from "@/components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

const accountFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const Accounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1",
      username: "admin",
      role: "facilitator",
      createdAt: "2024-01-15",
    },
    {
      id: "2", 
      username: "teacher1",
      role: "facilitator",
      createdAt: "2024-01-20",
    },
  ]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "facilitator",
    },
  });

  const onSubmit = (values: AccountFormValues) => {
    if (editingAccount) {
      // Update existing account
      setAccounts(prev => prev.map(account => 
        account.id === editingAccount.id 
          ? { ...account, username: values.username, role: values.role || "facilitator" }
          : account
      ));
      toast({
        title: "Account updated",
        description: `Account for ${values.username} has been updated successfully.`,
      });
      setEditingAccount(null);
    } else {
      // Create new account
      const newAccount: Account = {
        id: Date.now().toString(),
        username: values.username,
        role: values.role || "facilitator",
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts(prev => [...prev, newAccount]);
      toast({
        title: "Account created",
        description: `New account for ${values.username} has been created successfully.`,
      });
    }
    
    form.reset();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    form.setValue("username", account.username);
    form.setValue("role", account.role);
    form.setValue("password", ""); // Don't pre-fill password for security
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    setAccounts(prev => prev.filter(account => account.id !== accountId));
    toast({
      title: "Account deleted",
      description: `Account for ${account?.username} has been deleted.`,
      variant: "destructive",
    });
  };

  const resetForm = () => {
    form.reset();
    setEditingAccount(null);
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-education-navy">Account Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage facilitator accounts and permissions
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Account" : "Create New Account"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder={editingAccount ? "Enter new password" : "Enter password"} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="facilitator">Facilitator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingAccount ? "Update Account" : "Create Account"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-education-navy">
              <Users className="w-5 h-5" />
              Facilitator Accounts ({accounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.username}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-primary/10 text-primary border-primary/20">
                        {account.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                          className="gap-1 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                          className="gap-1 hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {accounts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No accounts found. Create your first facilitator account to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Accounts;