import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CryptoConverter from "@/components/CryptoConverter";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddresses, setWalletAddresses] = useState({
    btc: "",
    eth: "",
    ltc: ""
  });
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [cryptoBalances, setCryptoBalances] = useState({ btc: 0, eth: 0, ltc: 0 });
  const [cryptoPrices, setCryptoPrices] = useState({ btc: 0, eth: 0, ltc: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Fetch user balances
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("btc_balance, eth_balance, ltc_balance")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setCryptoBalances({
            btc: profile.btc_balance || 0,
            eth: profile.eth_balance || 0,
            ltc: profile.ltc_balance || 0,
          });
        }
      }

      // Fetch deposit addresses from website settings
      const { data: settingsData } = await supabase
        .from("website_settings")
        .select("*")
        .in("setting_key", ["deposit_btc_address", "deposit_eth_address", "deposit_ltc_address"]);

      if (settingsData) {
        const addresses: any = {
          btc: "Not configured yet",
          eth: "Not configured yet",
          ltc: "Not configured yet"
        };
        
        settingsData.forEach((setting) => {
          if (setting.setting_key === "deposit_btc_address") {
            addresses.btc = setting.setting_value !== "Not configured" ? setting.setting_value : "Not configured yet";
          } else if (setting.setting_key === "deposit_eth_address") {
            addresses.eth = setting.setting_value !== "Not configured" ? setting.setting_value : "Not configured yet";
          } else if (setting.setting_key === "deposit_ltc_address") {
            addresses.ltc = setting.setting_value !== "Not configured" ? setting.setting_value : "Not configured yet";
          }
        });
        
        setWalletAddresses(addresses);
      }

      // Fetch crypto prices
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
    fetchData();
  }, []);

  const handleCopy = (address: string, crypto: string) => {
    if (address === "Not configured yet") {
      toast.error("Wallet address not configured by admin");
      return;
    }
    navigator.clipboard.writeText(address);
    setCopied(crypto);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeposit = async () => {
    const currentAddress = selectedCrypto === "BTC" ? walletAddresses.btc : 
                          selectedCrypto === "ETH" ? walletAddresses.eth : 
                          walletAddresses.ltc;

    if (currentAddress === "Not configured yet") {
      toast.error("Wallet address not configured. Please contact admin.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userId) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: parseFloat(amount),
          currency: selectedCrypto,
          status: "pending",
          btc_address: currentAddress,
          narration: `Deposit of ${amount} ${selectedCrypto}`
        });

      if (error) throw error;

      toast.success(`Deposit request submitted! Please send ${selectedCrypto} to the address above.`);
      setAmount("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit deposit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Deposit & Convert</h1>
        <p className="text-muted-foreground mt-2">Fund your account or convert your crypto to USDT</p>
      </div>

      {/* Crypto Converter Section */}
      <CryptoConverter
        balances={cryptoBalances}
        prices={cryptoPrices}
        onConversionComplete={() => {
          // Refresh balances after conversion
          const fetchBalances = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("btc_balance, eth_balance, ltc_balance")
                .eq("user_id", user.id)
                .single();

              if (profile) {
                setCryptoBalances({
                  btc: profile.btc_balance || 0,
                  eth: profile.eth_balance || 0,
                  ltc: profile.ltc_balance || 0,
                });
              }
            }
          };
          fetchBalances();
        }}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or Deposit New Crypto</span>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <Tabs value={selectedCrypto} onValueChange={setSelectedCrypto}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="BTC">Bitcoin (BTC)</TabsTrigger>
            <TabsTrigger value="ETH">Ethereum (ETH)</TabsTrigger>
            <TabsTrigger value="LTC">Litecoin (LTC)</TabsTrigger>
          </TabsList>

          {["BTC", "ETH", "LTC"].map((crypto) => {
            const address = crypto === "BTC" ? walletAddresses.btc : 
                          crypto === "ETH" ? walletAddresses.eth : 
                          walletAddresses.ltc;
            
            return (
              <TabsContent key={crypto} value={crypto} className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{crypto} Deposit Address</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send {crypto} to this address. Your account will be credited after confirmations.
                    </p>
                    
                    <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-sm font-mono break-all flex-1">
                          {address}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(address, crypto)}
                          className="shrink-0"
                        >
                          {copied === crypto ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Expected Amount ({crypto})</Label>
                      <Input
                        id="amount"
                        type="number"
                        step={crypto === "BTC" ? "0.00000001" : crypto === "ETH" ? "0.000001" : "0.0001"}
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Enter the amount you're planning to deposit for tracking purposes
                      </p>
                    </div>

                    <Button 
                      onClick={handleDeposit} 
                      disabled={loading || !amount || address === "Not configured yet"}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? "Submitting..." : `Submit ${crypto} Deposit Request`}
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-amber-600 dark:text-amber-400">
                    Important Notes:
                  </h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Deposits require network confirmations</li>
                    <li>• Only send {crypto} to this address</li>
                    <li>• Sending other cryptocurrencies will result in permanent loss</li>
                    <li>• Contact support if you have any questions</li>
                  </ul>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </div>
  );
};

export default Deposit;
