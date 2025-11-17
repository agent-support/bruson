import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield } from "lucide-react";
const HeroSection = () => {
  return <section id="home" className="pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Brunson{" "}
                <span className="text-primary">Crypto</span>{" "}
                <span className="text-secondary">Trading</span>{" "}
                Platform
              </h1>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Trade smarter with institutional-grade analytics, automated strategies, and real-time market insights. 
              Brunson combines AI-driven execution, transparent risk controls, and secure custody so you can 
              grow your portfolio with confidence.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="gradient" size="lg" className="text-base px-8" onClick={() => window.location.href = '/auth'}>
                Start Trading Now
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8" onClick={() => window.location.href = '/demo'}>
                Demo Account
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">98.7%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-success">$2.1M+</div>
                <div className="text-sm text-muted-foreground">Total Profits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>

          {/* Right Content - Live Trading Card */}
          <div className="space-y-4">
            <Card className="p-6 shadow-xl border-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Live Trading</h3>
                <div className="flex items-center gap-2 text-success">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <span className="font-medium">BTC/USD</span>
                  <span className="text-success font-bold">+12.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <span className="font-medium">ETH/USD</span>
                  <span className="text-success font-bold">+8.3%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <span className="font-medium">USDT/USD</span>
                  <span className="text-success font-bold">+3.2%</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Profit Today</span>
                    <span className="text-xl font-bold text-success">+$1,247.83</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-1">AI Trading</h4>
                <p className="text-sm text-muted-foreground">Automated strategies</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-1">Secure</h4>
                <p className="text-sm text-muted-foreground">Bank-level security</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;