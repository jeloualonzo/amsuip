import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  Calendar,
  GraduationCap,
  UserCog,
  FileImage,
  Settings,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: UserCheck, label: "Take Attendance", href: "/attendance" },
    { icon: FileText, label: "Records", href: "/records" },
    { icon: FileImage, label: "Excuse Application", href: "/excuse-applications" },
    { icon: Users, label: "Students", href: "/students" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: UserCog, label: "Accounts", href: "/accounts" },
  ];

  return (
    <nav className="w-64 bg-gradient-card border-r border-border min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              AttendTracker
            </h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationCenter />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 transition-all duration-200",
                    isActive 
                      ? "bg-gradient-primary shadow-glow scale-105" 
                      : "hover:bg-accent/5 hover:scale-105 hover:shadow-card"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border/50">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 hover:bg-accent/5">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 hover:bg-destructive/5 hover:text-destructive">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;