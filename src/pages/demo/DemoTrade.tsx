import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DemoTrade {
  id: string;
  cryptocurrency: string;
  position_type: string;
  entry_price: number;
  current_price: number;
  amount: number;
  leverage: number;
  pnl: number;
  timestamp: number;
}

const DemoTrade = () => {
  const { toast } = useToast();
  const [demoBalance, setDemoBalance] = useState(100000);
  const [trades, setTrades] = useState<DemoTrade[]>([]);
  const [cryptocurrency, setCryptocurrency] = useState("bitcoin");
  const [positionType, setPositionType] = useState("long");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: number }>({});
  const [chartData, setChartData] = useState<{ time: string; price: number }[]>([]);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);

  useEffect(() => {
    const savedBalance = localStorage.getItem("demoBalance");
    const savedTrades = localStorage.getItem("demoTrades");
    if (savedBalance) setDemoBalance(parseFloat(savedBalance));
    if (savedTrades) setTrades(JSON.parse(savedTrades));
  }, []);

  useEffect(() => {
    fetchPrice();
    fetchAllPrices();
    fetchChartData();
    const interval = setInterval(() => {
      fetchPrice();
      fetchAllPrices();
      fetchChartData();
    }, 30000);
    return () => clearInterval(interval);
  }, [cryptocurrency, trades]);

  const fetchPrice = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptocurrency}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await response.json();
      setCurrentPrice(data[cryptocurrency]?.usd || 0);
      setPriceChange24h(data[cryptocurrency]?.usd_24h_change || 0);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${cryptocurrency}/market_chart?vs_currency=usd&days=1`
      );
      const data = await response.json();
      const prices = data.prices.map((price: [number, number]) => ({
        time: new Date(price[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: price[1]
      }));
      setChartData(prices);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchAllPrices = async () => {
    try {
      const uniqueCryptos = [...new Set(trades.map(t => t.cryptocurrency))];
      if (uniqueCryptos.length === 0) return;

      const ids = uniqueCryptos.join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );
      const data = await response.json();
      
      const prices: { [key: string]: number } = {};
      uniqueCryptos.forEach(crypto => {
        prices[crypto] = data[crypto]?.usd || 0;
      });
      
      setCryptoPrices(prices);
    } catch (error) {
      console.error("Error fetching all prices:", error);
    }
  };

  const handleTrade = () => {
    const tradeAmount = parseFloat(amount);
    const tradeLeverage = parseInt(leverage);

    if (!tradeAmount || tradeAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    const totalRequired = tradeAmount * tradeLeverage;
    if (totalRequired > demoBalance) {
      toast({ title: "Insufficient Balance", description: "Not enough demo funds", variant: "destructive" });
      return;
    }

    const newTrade: DemoTrade = {
      id: Date.now().toString(),
      cryptocurrency,
      position_type: positionType,
      entry_price: currentPrice,
      current_price: currentPrice,
      amount: tradeAmount,
      leverage: tradeLeverage,
      pnl: 0,
      timestamp: Date.now(),
    };

    const newBalance = demoBalance - totalRequired;
    const updatedTrades = [...trades, newTrade];

    setDemoBalance(newBalance);
    setTrades(updatedTrades);
    localStorage.setItem("demoBalance", newBalance.toString());
    localStorage.setItem("demoTrades", JSON.stringify(updatedTrades));

    toast({ title: "Trade Opened", description: `Demo ${positionType} position opened successfully` });
    setAmount("");
  };

  const closeTrade = (trade: DemoTrade) => {
    const currentTradePrice = cryptoPrices[trade.cryptocurrency] || trade.current_price;
    const priceChange = currentTradePrice - trade.entry_price;
    const multiplier = trade.position_type === "long" ? 1 : -1;
    const pnl = (priceChange * multiplier * trade.amount * trade.leverage) / trade.entry_price;
    
    const newBalance = demoBalance + trade.amount + pnl;
    const updatedTrades = trades.filter(t => t.id !== trade.id);

    setDemoBalance(newBalance);
    setTrades(updatedTrades);
    localStorage.setItem("demoBalance", newBalance.toString());
    localStorage.setItem("demoTrades", JSON.stringify(updatedTrades));

    toast({
      title: "Trade Closed",
      description: `Demo PNL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
      variant: pnl >= 0 ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-3 md:p-4 bg-gradient-to-r from-warning/10 to-primary/10 border-warning/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-sm">Demo Mode Active</p>
            <p className="text-xs text-muted-foreground">
              You're trading with virtual funds. Perfect your strategy here before trading with real money!
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Demo Trading</h1>
        <p className="text-sm md:text-base text-muted-foreground">Practice trading with virtual funds - Learn the platform risk-free</p>
        <p className="text-base md:text-lg font-semibold mt-2">Demo Balance: ${demoBalance.toLocaleString()}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Bitcoin Live Price Chart</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${currentPrice.toLocaleString()}</span>
              <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="flex items-center gap-1">
                {priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(priceChange24h).toFixed(2)}%
              </Badge>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4">Open Position</h2>
          <div className="space-y-4">
            <div>
              <Label>Cryptocurrency</Label>
              <Select value={cryptocurrency} onValueChange={setCryptocurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                  <SelectItem value="litecoin">Litecoin (LTC)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Current Price: ${currentPrice.toLocaleString()}
              </p>
            </div>

            <div>
              <Label>Position Type</Label>
              <Select value={positionType} onValueChange={setPositionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long (Buy)</SelectItem>
                  <SelectItem value="short">Short (Sell)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
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
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleTrade} className="w-full" disabled={loading}>
              Open Trade
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Open Positions</h2>
          <div className="space-y-3">
            {trades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No open trades</p>
            ) : (
              trades.map((trade) => {
                const currentTradePrice = cryptoPrices[trade.cryptocurrency] || trade.entry_price;
                const priceDiff = currentTradePrice - trade.entry_price;
                const multiplier = trade.position_type === "long" ? 1 : -1;
                const pnl = (priceDiff * multiplier * trade.amount * trade.leverage) / trade.entry_price;
                const pnlPercent = (pnl / trade.amount) * 100;

                return (
                  <Card key={trade.id} className="bg-card/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={trade.position_type === "long" ? "default" : "destructive"}
                            className={trade.position_type === "long" ? "bg-success" : ""}
                          >
                            {trade.position_type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{trade.cryptocurrency.toUpperCase()}/USDT</span>
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
                          <p className="font-medium">${currentTradePrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">${trade.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">PNL</p>
                          <p className={`font-medium ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoTrade;
