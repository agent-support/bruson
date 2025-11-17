import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, DollarSign, Target } from "lucide-react";

interface Investment {
  id: string;
  plan_name: string;
  amount: number;
  daily_rate: number;
  duration_days: number;
  maturity_date: string;
  created_at: string;
  status: string;
}

interface ActiveInvestmentsProps {
  investments: Investment[];
}

const ActiveInvestments = ({ investments }: ActiveInvestmentsProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update every second for live profit growth
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateCurrentProfit = (investment: Investment) => {
    const startDate = new Date(investment.created_at);
    const now = new Date(currentTime);
    const elapsedMs = now.getTime() - startDate.getTime();
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    
    // Calculate profit including fractional days
    const currentProfit = investment.amount * investment.daily_rate * elapsedDays;
    const totalPossibleProfit = investment.amount * investment.daily_rate * investment.duration_days;
    
    return {
      currentProfit: Math.min(currentProfit, totalPossibleProfit),
      totalPossibleProfit,
      elapsedDays: Math.min(elapsedDays, investment.duration_days),
      progress: Math.min((elapsedDays / investment.duration_days) * 100, 100)
    };
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "Starter Plan":
        return { bg: "from-blue-500/20 to-blue-600/20", border: "border-blue-500/30", accent: "text-blue-400" };
      case "Professional Plan":
        return { bg: "from-purple-500/20 to-purple-600/20", border: "border-purple-500/30", accent: "text-purple-400" };
      case "Premium Plan":
        return { bg: "from-amber-500/20 to-amber-600/20", border: "border-amber-500/30", accent: "text-amber-400" };
      case "VIP Plan":
        return { bg: "from-emerald-500/20 to-emerald-600/20", border: "border-emerald-500/30", accent: "text-emerald-400" };
      default:
        return { bg: "from-gray-500/20 to-gray-600/20", border: "border-gray-500/30", accent: "text-gray-400" };
    }
  };

  if (investments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Active Investments</h2>
        <p className="text-muted-foreground">Watch your profits grow in real-time</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {investments.map((investment) => {
          const { currentProfit, totalPossibleProfit, elapsedDays, progress } = calculateCurrentProfit(investment);
          const colors = getPlanColor(investment.plan_name);
          const daysRemaining = Math.max(0, investment.duration_days - elapsedDays);

          return (
            <Card key={investment.id} className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{investment.plan_name}</CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {(investment.daily_rate * 100).toFixed(1)}% daily
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Investment Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Principal</span>
                  </div>
                  <span className="font-semibold">
                    ${investment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Current Profit - Live Growing */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Current Profit</span>
                  </div>
                  <span className={`font-bold text-lg ${colors.accent}`}>
                    +${currentProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Total Return */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Total Return</span>
                  </div>
                  <span className="font-bold text-primary">
                    ${(investment.amount + currentProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Progress</span>
                    </div>
                    <span className="text-muted-foreground">
                      {daysRemaining.toFixed(1)} days remaining
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Day {elapsedDays.toFixed(1)}</span>
                    <span>Day {investment.duration_days}</span>
                  </div>
                </div>

                {/* Expected Final Profit */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected Final Profit</span>
                    <span className="font-semibold text-green-500">
                      +${totalPossibleProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveInvestments;
