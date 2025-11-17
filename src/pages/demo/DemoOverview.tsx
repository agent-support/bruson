import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Wallet, DollarSign, Check, X, Activity } from "lucide-react";

const DemoOverview = () => {
  const [demoBalance, setDemoBalance] = useState(100000);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    const savedBalance = localStorage.getItem("demoBalance");
    if (savedBalance) {
      setDemoBalance(parseFloat(savedBalance));
    }
    
    fetchBitcoinPrice();
    const interval = setInterval(fetchBitcoinPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      setBtcPrice(data.bitcoin?.usd || 0);
      setPriceChange(data.bitcoin?.usd_24h_change || 0);
    } catch (error) {
      console.error("Error fetching Bitcoin price:", error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Demo Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Practice trading with virtual funds</p>
      </div>

      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="space-y-3">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Welcome to Demo Trading
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            This is your risk-free training ground! Practice your trading strategies with <strong>$100,000 in virtual funds</strong>. 
            Master the platform, test your theories, and build confidence before trading with real money.
          </p>
          <div className="grid gap-3 md:grid-cols-2 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-semibold text-sm">Learn Without Risk</p>
                <p className="text-xs text-muted-foreground">Experiment with different strategies safely</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-semibold text-sm">Real Market Prices</p>
                <p className="text-xs text-muted-foreground">Practice with live cryptocurrency data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <span className="text-xl">🎓</span>
              <div>
                <p className="font-semibold text-sm">Build Your Skills</p>
                <p className="text-xs text-muted-foreground">Master trading before going live</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <span className="text-xl">⚡</span>
              <div>
                <p className="font-semibold text-sm">No Pressure</p>
                <p className="text-xs text-muted-foreground">Take your time to learn and improve</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Demo Balance</p>
              <p className="text-2xl font-bold">${demoBalance.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Trades</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-green-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total PNL</p>
              <p className="text-2xl font-bold text-success">$0.00</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-center">Demo vs Real Account</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold">Feature</th>
                <th className="text-center py-3 px-2 font-semibold text-primary">Demo Account</th>
                <th className="text-center py-3 px-2 font-semibold text-success">Real Account</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Starting Balance</td>
                <td className="text-center py-3 px-2">$100,000 Virtual</td>
                <td className="text-center py-3 px-2">Your Deposit</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Financial Risk</td>
                <td className="text-center py-3 px-2 text-success">Zero Risk</td>
                <td className="text-center py-3 px-2 text-warning">Real Money</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Live Market Prices</td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Trading Features</td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Leverage Trading</td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Deposit & Withdraw</td>
                <td className="text-center py-3 px-2"><X className="inline w-5 h-5 text-destructive" /></td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Real Profits</td>
                <td className="text-center py-3 px-2"><X className="inline w-5 h-5 text-destructive" /></td>
                <td className="text-center py-3 px-2"><Check className="inline w-5 h-5 text-success" /></td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">Purpose</td>
                <td className="text-center py-3 px-2 text-primary">Practice & Learn</td>
                <td className="text-center py-3 px-2 text-success">Real Trading</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            <strong className="text-foreground">Ready to go live?</strong> Once you're comfortable with the demo account, 
            create a real account to start earning actual profits from your trading strategies!
          </p>
        </div>
      </Card>

      <Card className="p-6 border-success/30 bg-success/5">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="text-xl">✨</span>
          Pro Trading Tips
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-success font-bold">1.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Start Small:</strong> Begin with smaller positions to understand market movements without overwhelming risk.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-success font-bold">2.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Use Leverage Wisely:</strong> Higher leverage means higher risk. Practice with 1x-2x before using higher multipliers.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-success font-bold">3.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Track Your Performance:</strong> Monitor your wins and losses to identify what strategies work best.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-success font-bold">4.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Ready for Real Trading?</strong> Once you're consistently profitable in demo mode, consider upgrading to a live account!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DemoOverview;
