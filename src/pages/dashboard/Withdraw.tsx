import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Withdraw = () => {
  const [withdrawalMethod, setWithdrawalMethod] = useState("btc");
  const [amount, setAmount] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Bank details
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("usd_balance")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setBalance(profile.usd_balance || 0);
        }
      }
    };
    
    fetchUserData();

    // Set up realtime subscription for profile updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('withdraw-balance-changes')
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
            setBalance(payload.new.usd_balance || 0);
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtimeSubscription();
    
    return () => {
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawalMethod === "btc") {
      if (!btcAddress || btcAddress.length < 26) {
        toast.error("Please enter a valid Bitcoin address");
        return;
      }
    } else if (withdrawalMethod === "bank") {
      if (!accountName || !accountNumber || !bankName) {
        toast.error("Please fill in all bank details");
        return;
      }
    }

    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!userId) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);

    try {
      const transactionData: any = {
        user_id: userId,
        type: "withdraw",
        amount: parseFloat(amount),
        status: "pending",
      };

      if (withdrawalMethod === "btc") {
        transactionData.currency = "BTC";
        transactionData.btc_address = btcAddress;
        transactionData.narration = narration || `Withdrawal of $${amount} to ${btcAddress.substring(0, 10)}...`;
      } else {
        transactionData.currency = "BANK";
        transactionData.narration = narration || `Bank withdrawal of $${amount} to ${accountName} - ${bankName}`;
        // Store bank details in narration field for now
        transactionData.btc_address = JSON.stringify({
          accountName,
          accountNumber,
          bankName
        });
      }

      // Insert withdrawal transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert(transactionData);

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ usd_balance: balance - parseFloat(amount) })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setBtcAddress("");
      setNarration("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
      setBalance(balance - parseFloat(amount));
    } catch (error: any) {
      toast.error(error.message || "Failed to submit withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Withdraw Bitcoin</h1>
        <p className="text-muted-foreground mt-2">Withdraw funds to your Bitcoin wallet</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="withdrawal-method">Withdrawal Method</Label>
              <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {withdrawalMethod === "btc" ? (
              <div>
                <Label htmlFor="btc-address">Bitcoin Address</Label>
                <Input
                  id="btc-address"
                  placeholder="Enter your BTC address (e.g., bc1q...)"
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Double-check your address. Transactions cannot be reversed.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    placeholder="Enter account holder name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    placeholder="Enter bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="withdraw-amount">Amount (USD)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Enter the amount you wish to withdraw
              </p>
            </div>

            <div>
              <Label htmlFor="narration">Narration (Optional)</Label>
              <Textarea
                id="narration"
                placeholder="Add a note for this withdrawal..."
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleWithdraw} 
              disabled={loading || !amount || (withdrawalMethod === "btc" ? !btcAddress : (!accountName || !accountNumber || !bankName))}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : "Submit Withdrawal"}
            </Button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-2 text-amber-600 dark:text-amber-400">
                  Withdrawal Information:
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Processing time: 1-24 hours</li>
                  {withdrawalMethod === "btc" ? (
                    <>
                      <li>• Network fees will be deducted from your withdrawal</li>
                      <li>• Ensure your Bitcoin address is correct before submitting</li>
                    </>
                  ) : (
                    <>
                      <li>• Bank transfers may take 1-3 business days</li>
                      <li>• Ensure your bank details are correct before submitting</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Withdraw;
