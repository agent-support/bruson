import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CryptoConverterProps {
  balances: {
    btc: number;
    eth: number;
    ltc: number;
  };
  prices: {
    btc: number;
    eth: number;
    ltc: number;
  };
  onConversionComplete: () => void;
}

const CryptoConverter = ({ balances, prices, onConversionComplete }: CryptoConverterProps) => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const getCryptoBalance = () => {
    switch (selectedCrypto) {
      case "BTC":
        return balances.btc;
      case "ETH":
        return balances.eth;
      case "LTC":
        return balances.ltc;
      default:
        return 0;
    }
  };

  const getCryptoPrice = () => {
    switch (selectedCrypto) {
      case "BTC":
        return prices.btc;
      case "ETH":
        return prices.eth;
      case "LTC":
        return prices.ltc;
      default:
        return 0;
    }
  };

  const calculateUSDT = () => {
    if (!amount) return 0;
    return parseFloat(amount) * getCryptoPrice();
  };

  const handleConvert = async () => {
    const cryptoAmount = parseFloat(amount);
    const cryptoBalance = getCryptoBalance();
    const cryptoPrice = getCryptoPrice();

    if (!amount || cryptoAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (cryptoAmount > cryptoBalance) {
      toast.error(`Insufficient ${selectedCrypto} balance`);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const usdtAmount = cryptoAmount * cryptoPrice;

      // Get current balances
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Update balances - deduct crypto, add USDT
      const updates: any = {
        usd_balance: (profile.usd_balance || 0) + usdtAmount,
      };

      if (selectedCrypto === "BTC") {
        updates.btc_balance = (profile.btc_balance || 0) - cryptoAmount;
      } else if (selectedCrypto === "ETH") {
        updates.eth_balance = (profile.eth_balance || 0) - cryptoAmount;
      } else if (selectedCrypto === "LTC") {
        updates.ltc_balance = (profile.ltc_balance || 0) - cryptoAmount;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "conversion",
        amount: usdtAmount,
        currency: "USDT",
        status: "completed",
        narration: `Converted ${cryptoAmount} ${selectedCrypto} to $${usdtAmount.toFixed(2)} USDT`,
      });

      toast.success(`Successfully converted ${cryptoAmount} ${selectedCrypto} to $${usdtAmount.toFixed(2)} USDT!`);
      setAmount("");
      onConversionComplete();
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast.error(error.message || "Failed to convert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-background border-purple-500/20">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
            <ArrowDownUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Convert Crypto to USDT</h3>
            <p className="text-sm text-muted-foreground">Exchange your crypto holdings for USDT balance</p>
          </div>
        </div>

        {/* Current Balances */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-background/50 rounded-lg border border-border">
          <div>
            <p className="text-xs text-muted-foreground">BTC Balance</p>
            <p className="font-semibold">{balances.btc.toFixed(8)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ETH Balance</p>
            <p className="font-semibold">{balances.eth.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">LTC Balance</p>
            <p className="font-semibold">{balances.ltc.toFixed(4)}</p>
          </div>
        </div>

        {/* Conversion Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="crypto-select">Select Cryptocurrency</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5">
              Available: {getCryptoBalance().toFixed(8)} {selectedCrypto}
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Amount to Convert</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5"
            />
            <Button
              variant="link"
              size="sm"
              onClick={() => setAmount(getCryptoBalance().toString())}
              className="text-xs px-0 h-auto mt-1"
            >
              Use Max
            </Button>
          </div>

          {/* Conversion Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You will receive:</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-500">
                    ${calculateUSDT().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    USDT (1 {selectedCrypto} = ${getCryptoPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleConvert}
            disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > getCryptoBalance()}
            className="w-full"
            size="lg"
          >
            {loading ? "Converting..." : `Convert ${selectedCrypto} to USDT`}
          </Button>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Important Notes</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Conversion is instant and uses current market rates</li>
            <li>• USDT balance can be used for trading and investments</li>
            <li>• This transaction is irreversible once confirmed</li>
            <li>• Converted USDT will appear in your wallet immediately</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default CryptoConverter;
