import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DemoSidebar } from "@/components/DemoSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const DemoDashboard = () => {
  const navigate = useNavigate();

  const handleExitDemo = () => {
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DemoSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/40 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 shadow-lg">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
              <div>
                <h1 className="text-sm md:text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">Demo Account</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Practice Trading with $100,000</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" onClick={handleExitDemo} className="hover:bg-destructive/10 hover:text-destructive transition-all h-8 w-8 md:h-10 md:w-10">
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Avatar className="ring-2 ring-primary/20 h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-xs md:text-sm">
                  D
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-3 md:p-6 bg-gradient-hero overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DemoDashboard;
