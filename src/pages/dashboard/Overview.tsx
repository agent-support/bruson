import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Wallet, History, CreditCard, ArrowDownToLine, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProfitCalculator from "@/components/ProfitCalculator";
import WalletDisplay from "@/components/WalletDisplay";
import InvestmentDialog from "@/components/InvestmentDialog";
import ActiveInvestments from "@/components/ActiveInvestments";

const Overview = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [cryptoPrices, setCryptoPrices] = useState({
    btc: 0,
    eth: 0,
    ltc: 0,
  });
  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [investmentDialog, setInvestmentDialog] = useState<{ open: boolean; plan: any | null }>({
    open: false,
    plan: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setProfile(data);

        // Fetch active trades
        const { data: tradesData } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "open");
        setActiveTrades(tradesData || []);

        // Fetch active investments
        const { data: investmentsData } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active");
        setInvestments(investmentsData || []);
      }
    };

    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd"
        );
        const data = await response.json();
        setCryptoPrices({
          btc: data.bitcoin?.usd || 0,
          eth: data.ethereum?.usd || 0,
          ltc: data.litecoin?.usd || 0,
        });
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    };

    fetchProfile();
    fetchCryptoPrices();

    // Set up realtime subscription for profile updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated in realtime:', payload);
            setProfile(payload.new);
            toast.success("Your balance has been updated!");
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtimeSubscription();

    // Update prices every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000);
    
    return () => {
      clearInterval(interval);
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  // Calculate total PNL from active trades
  const calculateTotalPNL = () => {
    if (activeTrades.length === 0) return 0;
    
    return activeTrades.reduce((total, trade) => {
      const currentPrice = cryptoPrices[trade.cryptocurrency.toLowerCase() as keyof typeof cryptoPrices];
      if (!currentPrice) return total;
      
      const priceDiff = currentPrice - trade.entry_price;
      const multiplier = trade.position_type === "long" ? 1 : -1;
      const pnl = (priceDiff * multiplier * trade.amount * trade.leverage) / trade.entry_price;
      return total + pnl;
    }, 0);
  };

  const calculateTotalROI = () => {
    if (activeTrades.length === 0) return 0;
    
    const totalInvested = activeTrades.reduce((sum, trade) => sum + trade.amount, 0);
    if (totalInvested === 0) return 0;
    
    return (calculateTotalPNL() / totalInvested) * 100;
  };

  const totalPNL = calculateTotalPNL();
  const totalROI = calculateTotalROI();

  const handleInvest = (plan: any) => {
    setInvestmentDialog({ open: true, plan });
  };

  const confirmInvestment = async (days: number, amount: number) => {
    const plan = investmentDialog.plan;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dailyRate = parseFloat(plan.dailyRate.replace('%', '')) / 100;
      const maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + days);

      // Create investment record
      const { error: investError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_name: plan.name,
          amount: amount,
          daily_rate: dailyRate,
          duration_days: days,
          maturity_date: maturityDate.toISOString()
        });

      if (investError) throw investError;

      // Deduct from balance
      const newBalance = (profile?.usd_balance || 0) - amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ usd_balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh investments
      const { data: investmentsData } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");
      setInvestments(investmentsData || []);

      setInvestmentDialog({ open: false, plan: null });
      toast.success(`Successfully invested $${amount.toFixed(2)} in ${plan.name} for ${days} days!`);
    } catch (error) {
      console.error('Investment error:', error);
      toast.error("Failed to process investment. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <WalletDisplay 
        usdBalance={profile?.usd_balance || 0}
        btcBalance={profile?.btc_balance || 0}
        ethBalance={profile?.eth_balance || 0}
        ltcBalance={profile?.ltc_balance || 0}
        profitBalance={profile?.profit_balance || 0}
        roiBalance={profile?.roi_balance || 0}
        btcPrice={cryptoPrices.btc}
        ethPrice={cryptoPrices.eth}
        ltcPrice={cryptoPrices.ltc}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bitcoin Live Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-2xl">₿</span>
              <CardTitle>Bitcoin Live Chart</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-background">
              <iframe
                src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BTCUSD&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BTCUSD"
                className="w-full h-full"
                frameBorder="0"
                allowTransparency={true}
                scrolling="no"
                allowFullScreen={true}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="text-xl font-bold text-green-500">
                ${cryptoPrices.btc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Portfolio Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-foreground">Active Trades Profit</span>
                  </div>
                  <span className={`text-xl font-bold ${totalPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalPNL >= 0 ? '+' : ''}${totalPNL.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-foreground">Active Trades</span>
                  </div>
                  <span className="text-xl font-bold text-blue-400">{activeTrades.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-400" />
                    <span className="text-foreground">Active Trades ROI</span>
                  </div>
                  <span className={`text-xl font-bold ${totalROI >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate("/dashboard/trade")}
          className="h-20 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
        >
          <BarChart3 className="mr-2 h-5 w-5" />
          Start Trading
        </Button>

        <Button
          onClick={() => navigate("/dashboard/deposit")}
          className="h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Deposit Funds
        </Button>

        <Button
          onClick={() => navigate("/dashboard/withdraw")}
          className="h-20 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
        >
          <ArrowDownToLine className="mr-2 h-5 w-5" />
          Withdraw
        </Button>

        <Button
          onClick={() => navigate("/dashboard/history")}
          className="h-20 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0"
        >
          <History className="mr-2 h-5 w-5" />
          View History
        </Button>
      </div>

      {/* Investment Plans */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Investment Plans</h2>
          <p className="text-muted-foreground">Choose a plan that fits your investment goals (Minimum: $100)</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Starter Plan",
              dailyRate: "5%",
              minInvest: "$100",
              maxInvest: "$5,000",
              duration: "7 days",
              features: ["Daily Returns", "24/7 Support", "Instant Withdrawal"],
              color: "from-blue-500/20 to-blue-600/20",
              border: "border-blue-500/30"
            },
            {
              name: "Professional Plan",
              dailyRate: "10%",
              minInvest: "$5,001",
              maxInvest: "$20,000",
              duration: "14 days",
              features: ["Higher Returns", "Priority Support", "Dedicated Manager", "Risk Protection"],
              color: "from-purple-500/20 to-purple-600/20",
              border: "border-purple-500/30",
              popular: true
            },
            {
              name: "Premium Plan",
              dailyRate: "15%",
              minInvest: "$20,001",
              maxInvest: "$50,000",
              duration: "30 days",
              features: ["Premium Returns", "VIP Support", "Personal Advisor", "Advanced Analytics"],
              color: "from-amber-500/20 to-amber-600/20",
              border: "border-amber-500/30"
            },
            {
              name: "VIP Plan",
              dailyRate: "20%",
              minInvest: "$50,001",
              maxInvest: "Unlimited",
              duration: "60 days",
              features: ["Elite Returns", "Concierge Service", "Portfolio Diversification", "Tax Advisory"],
              color: "from-emerald-500/20 to-emerald-600/20",
              border: "border-emerald-500/30"
            }
          ].map((plan) => (
            <Card key={plan.name} className={`relative overflow-hidden bg-gradient-to-br ${plan.color} ${plan.border} border-2`}>
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">{plan.dailyRate}</div>
                  <p className="text-sm text-muted-foreground">Daily Returns</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min Investment:</span>
                    <span className="font-semibold">{plan.minInvest}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Investment:</span>
                    <span className="font-semibold">{plan.maxInvest}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{plan.duration}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleInvest(plan)}
                >
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Investments */}
      <ActiveInvestments investments={investments} />

      {/* Profit Calculator */}
      <ProfitCalculator />

      {/* Investment Dialog */}
      <InvestmentDialog
        open={investmentDialog.open}
        onOpenChange={(open) => setInvestmentDialog({ open, plan: null })}
        plan={investmentDialog.plan}
        balance={profile?.usd_balance || 0}
        onConfirm={confirmInvestment}
      />
    </div>
  );
};

export default Overview;
