import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProfitCalculator = () => {
  const [investment, setInvestment] = useState(100);
  const [selectedPlan, setSelectedPlan] = useState("professional");

  const plans = {
    starter: { name: "Starter Plan", dailyRate: 5 },
    professional: { name: "Professional Plan", dailyRate: 10 },
    premium: { name: "Premium Plan", dailyRate: 15 },
    vip: { name: "VIP Plan", dailyRate: 20 },
  };

  const calculateProfit = () => {
    const plan = plans[selectedPlan as keyof typeof plans];
    const dailyRate = plan.dailyRate / 100;
    
    // Simple daily profit calculation
    const dailyProfit = (investment * dailyRate).toFixed(2);
    const monthlyProfit = (parseFloat(dailyProfit) * 30).toFixed(2);
    
    return {
      dailyProfit,
      monthlyProfit,
      roi: plan.dailyRate.toString(),
    };
  };

  const results = calculateProfit();

  return (
    <section id="calculator" className="py-20 px-4 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Profit Calculator
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Calculate your potential profits with our advanced trading algorithms. See how your 
            investment can grow with compound returns.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calculator Inputs */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6">Investment Calculator</h3>

            <div className="space-y-8">
              {/* Investment Amount */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Investment Amount ($)</label>
                  <span className="text-2xl font-bold text-primary">
                    ${investment.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[investment]}
                  onValueChange={(value) => setInvestment(value[0])}
                  min={100}
                  max={100000}
                  step={100}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">Minimum: $100</p>
              </div>

              {/* Trading Plan */}
              <div>
                <label className="font-semibold block mb-3">Trading Plan</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      Starter Plan (5% daily)
                    </SelectItem>
                    <SelectItem value="professional">
                      Professional Plan (10% daily)
                    </SelectItem>
                    <SelectItem value="premium">
                      Premium Plan (15% daily)
                    </SelectItem>
                    <SelectItem value="vip">
                      VIP Plan (20% daily)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <Button variant="gradient" size="lg" className="w-full">
                Start Trading with {plans[selectedPlan as keyof typeof plans].name}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-8 bg-gradient-stats">
            <h3 className="text-2xl font-bold mb-6">Projected Returns</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Daily Profit
                  </div>
                  <div className="text-xl font-bold text-success">
                    ${results.dailyProfit}
                  </div>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Monthly Profit
                  </div>
                  <div className="text-xl font-bold text-success">
                    ${results.monthlyProfit}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-6 bg-card rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Initial Investment</span>
                  <span className="font-semibold">
                    ${investment.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Daily ROI Rate
                  </span>
                  <span className="font-bold text-success">
                    {results.roi}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-success/10 rounded-lg text-center">
                <div className="text-3xl font-bold text-success mb-1">
                  ${results.dailyProfit}
                </div>
                <div className="text-sm text-muted-foreground">
                  Daily Earnings
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Disclaimer:</strong> These calculations are projections based on 
                  historical performance. Past performance does not guarantee future results. 
                  Cryptocurrency trading involves risk, and you should never invest more than 
                  you can afford to lose.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;
