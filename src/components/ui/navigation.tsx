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
  FileImage
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: FileText, label: "Records", href: "/records" },
    { icon: FileImage, label: "Excuse Application", href: "/excuse-applications" },
    { icon: Users, label: "Students", href: "/students" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: UserCog, label: "Accounts", href: "/accounts" },
  ];

  return (
    <nav className="w-64 bg-gradient-card border-r border-border min-h-screen p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-education-navy">AttendTracker</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-gradient-primary shadow-glow"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;