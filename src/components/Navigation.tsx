import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import fintrixLogo from "@/assets/fintrix-logo.jpg";
const Navigation = () => {
  const navigate = useNavigate();
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={fintrixLogo} alt="Fintrix Trade" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xl font-bold text-foreground">
              Fintrix Trade
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#plans" className="text-foreground hover:text-primary transition-colors">
              Plans
            </a>
            <a href="#calculator" className="text-foreground hover:text-primary transition-colors">
              Calculator
            </a>
            
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="gradient" className="shadow-lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;