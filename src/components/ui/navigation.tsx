import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  Calendar,
  GraduationCap,
  Menu,
  X,
  UserCog,
  ClipboardCheck,
  School,
  Book,
  CalendarRange
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import { useState, useEffect } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";

// Navigation items configuration
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { 
    icon: UserCheck, 
    label: "Take Attendance", 
    href: "/take-attendance",
    isActive: (path: string) => path === '/take-attendance' || path.startsWith('/take-attendance/')
  },
  { 
    icon: Calendar, 
    label: "Schedule", 
    href: "/schedule",
    isActive: (path: string) => path === '/schedule' || path.startsWith('/sessions/') 
  },
  { icon: Users, label: "Students", href: "/students" },
  { icon: FileText, label: "Records", href: "/records" },
  { 
    icon: ClipboardCheck, 
    label: "Excuse Application", 
    href: "/excuse-application",
    isActive: (path: string) => path === '/excuse-application'
  },
  { icon: CalendarRange, label: "Academic Year", href: "/academic-year" },
  { icon: UserCog, label: "Accounts", href: "/accounts" },
];

// Desktop Sidebar Navigation
const DesktopNavigation = () => {
  const location = useLocation();
  
  return (
    <div className="hidden md:flex md:flex-col h-full">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-education-navy">AMSUIP</h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.isActive 
              ? item.isActive(location.pathname) 
              : location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 transition-all duration-200 group relative overflow-visible",
                    isActive 
                      ? "bg-gradient-primary shadow-glow text-white" 
                      : "hover:bg-[hsl(214,84%,56%)] hover:bg-opacity-10 hover:text-foreground"
                  )}
                  style={{
                    margin: '2px 0',
                    transform: 'translateY(0)'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* User profile section at the bottom */}
      <div className="mt-auto pt-4">
        <UserProfile />
      </div>
    </div>
  );
};

// Mobile Sidebar Navigation (Drawer)
const MobileDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-background p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-education-navy">AMSUIP</h1>
              <p className="text-sm text-muted-foreground">Menu</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.isActive 
              ? item.isActive(location.pathname) 
              : location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} to={item.href} onClick={onClose}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 transition-all duration-200 group relative overflow-visible",
                    isActive 
                      ? "bg-gradient-primary shadow-glow text-white" 
                      : "hover:bg-[hsl(214,84%,56%)] hover:bg-opacity-10 hover:text-foreground"
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
    </div>
  );
};

// Mobile Header with Hamburger Menu
const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-bold text-education-navy">AMSUIP</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
};

// Main Navigation Component
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isDesktop) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop]);

  return (
    <>
      <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <nav className="fixed top-0 left-0 h-screen w-64 bg-gradient-card border-r border-border p-6 flex-col hidden md:flex">
        <DesktopNavigation />
      </nav>
    </>
  );
};

export default Navigation;
