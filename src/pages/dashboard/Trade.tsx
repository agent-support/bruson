import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

const Trade = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [cryptocurrency, setCryptocurrency] = useState("BTC");
  const [positionType, setPositionType] = useState<"long" | "short">("long");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setProfile(profileData);

        const { data: tradesData } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "open")
          .order("created_at", { ascending: false });
        setTrades(tradesData || []);
      }
    };

    fetchData();
    fetchPrice();
    
    // Set up realtime subscription for profile updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('trade-balance-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Balance updated in realtime:', payload);
            setProfile(payload.new);
            toast({
              title: "Balance Updated",
              description: "Your balance has been updated by admin",
            });
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtimeSubscription();
    
    const interval = setInterval(fetchPrice, 30000);
    return () => {
      clearInterval(interval);
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const fetchPrice = async () => {
    try {
      const coinGeckoMap: { [key: string]: string } = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        LTC: 'litecoin'
      };
      const coinId = coinGeckoMap[cryptocurrency];
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      const data = await response.json();
      if (data[coinId] && data[coinId].usd) {
        setCurrentPrice(data[coinId].usd);
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, [cryptocurrency]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const tradeAmount = parseFloat(amount);
    const totalCost = tradeAmount;

    if (totalCost > (profile?.usd_balance || 0)) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this trade",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: tradeError } = await supabase.from("trades").insert({
        user_id: user?.id,
        cryptocurrency: cryptocurrency,
        position_type: positionType,
        entry_price: currentPrice,
        current_price: currentPrice,
        amount: tradeAmount,
        leverage: parseInt(leverage),
        pnl: 0,
        status: "open",
      });

      if (tradeError) throw tradeError;

      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ usd_balance: (profile?.usd_balance || 0) - totalCost })
        .eq("user_id", user?.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Trade opened",
        description: `${positionType.toUpperCase()} position opened for ${amount} USD`,
      });

      setAmount("");
      window.location.reload();
    } catch (error) {
      console.error("Error creating trade:", error);
      toast({
        title: "Error",
        description: "Failed to create trade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeTrade = async (trade: any) => {
    try {
      const priceDiff = currentPrice - trade.entry_price;
      const multiplier = trade.position_type === "long" ? 1 : -1;
      const pnl = (priceDiff * multiplier * trade.amount * trade.leverage) / trade.entry_price;
      
      const { error: tradeError } = await supabase
        .from("trades")
        .update({ 
          status: "closed", 
          closed_at: new Date().toISOString(),
          current_price: currentPrice,
          pnl: pnl
        })
        .eq("id", trade.id);

      if (tradeError) throw tradeError;

      const newBalance = (profile?.usd_balance || 0) + trade.amount + pnl;
      
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ usd_balance: newBalance })
        .eq("user_id", trade.user_id);

      if (balanceError) throw balanceError;

      toast({
        title: "Trade closed",
        description: `PNL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error closing trade:", error);
      toast({
        title: "Error",
        description: "Failed to close trade",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trade</h1>
        <p className="text-muted-foreground">Open and manage your trading positions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Open Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cryptocurrency</Label>
              <Select value={cryptocurrency} onValueChange={setCryptocurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Current Price</Label>
              <div className="text-2xl font-bold text-green-500">
                ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Margin Required</Label>
                <div className="text-lg font-semibold">
                  ${amount ? (parseFloat(amount)).toFixed(2) : '0.00'}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position Size</Label>
                <div className="text-lg font-semibold">
                  ${amount && leverage ? (parseFloat(amount) * parseInt(leverage)).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            <div>
              <Label>Position Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={positionType === "long" ? "default" : "outline"}
                  onClick={() => setPositionType("long")}
                  className={positionType === "long" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Long
                </Button>
                <Button
                  variant={positionType === "short" ? "default" : "outline"}
                  onClick={() => setPositionType("short")}
                  className={positionType === "short" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Short
                </Button>
              </div>
            </div>

            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: ${(profile?.usd_balance || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <Label>Leverage</Label>
              <Select value={leverage} onValueChange={setLeverage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                  <SelectItem value="20">20x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleTrade}
              disabled={loading}
            >
              Open {positionType.toUpperCase()} Position
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Recent Trades</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No trades yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start your crypto trading journey
                </p>
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => (document.querySelector('input[type="number"]') as HTMLInputElement)?.focus()}
                >
                  Start Your First Trade
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {trades.map((trade) => {
                  const priceDiff = currentPrice - trade.entry_price;
                  const multiplier = trade.position_type === "long" ? 1 : -1;
                  const pnl = (priceDiff * multiplier * trade.amount * trade.leverage) / trade.entry_price;
                  const pnlPercent = (pnl / trade.amount) * 100;

                  return (
                    <Card key={trade.id} className="bg-card/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={trade.position_type === "long" ? "default" : "destructive"}>
                              {trade.position_type.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{trade.cryptocurrency}/USDT</span>
                            <span className="text-xs text-muted-foreground">{trade.leverage}x</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => closeTrade(trade)}
                          >
                            Close
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Entry</p>
                            <p className="font-medium">${trade.entry_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-medium">${currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">${trade.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">PNL</p>
                            <p className={`font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Trade;
