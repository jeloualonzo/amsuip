import Navigation from "@/components/ui/navigation";
import { useMediaQuery } from "../hooks/use-media-query";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className={`flex-1 ${isDesktop ? 'md:ml-64' : ''} pt-4 md:pt-0 p-3 md:p-6`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;