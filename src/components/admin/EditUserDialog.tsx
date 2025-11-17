import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditUserDialog = ({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usd_balance: user?.usd_balance || 0,
    btc_balance: user?.btc_balance || 0,
    eth_balance: user?.eth_balance || 0,
    ltc_balance: user?.ltc_balance || 0,
    profit_balance: user?.profit_balance || 0,
    roi_balance: user?.roi_balance || 0,
    btc_wallet_address: user?.btc_wallet_address || "",
    eth_wallet_address: user?.eth_wallet_address || "",
    ltc_wallet_address: user?.ltc_wallet_address || "",
  });
  const [fundAmount, setFundAmount] = useState("");
  const [fundCurrency, setFundCurrency] = useState("usd");
  const [profitAmount, setProfitAmount] = useState("");
  const [roiAmount, setRoiAmount] = useState("");

  const handleAddFunds = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    const balanceKey = `${fundCurrency}_balance` as keyof typeof formData;
    setFormData(prev => ({
      ...prev,
      [balanceKey]: parseFloat(String(prev[balanceKey])) + amount
    }));
    setFundAmount("");
    const currencyLabel = fundCurrency.toUpperCase();
    toast.success(`Added ${amount.toFixed(8)} ${currencyLabel} to balance`);
  };

  const handleSubtractFunds = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    const balanceKey = `${fundCurrency}_balance` as keyof typeof formData;
    const newBalance = parseFloat(String(formData[balanceKey])) - amount;
    if (newBalance < 0) {
      toast.error("Insufficient balance");
      return;
    }
    setFormData(prev => ({
      ...prev,
      [balanceKey]: newBalance
    }));
    setFundAmount("");
    const currencyLabel = fundCurrency.toUpperCase();
    toast.success(`Subtracted ${amount.toFixed(8)} ${currencyLabel} from balance`);
  };

  const handleAddProfit = () => {
    const amount = parseFloat(profitAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    setFormData(prev => ({
      ...prev,
      profit_balance: parseFloat(String(prev.profit_balance)) + amount
    }));
    setProfitAmount("");
    toast.success(`Added $${amount.toFixed(2)} to profit`);
  };

  const handleSubtractProfit = () => {
    const amount = parseFloat(profitAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newBalance = parseFloat(String(formData.profit_balance)) - amount;
    if (newBalance < 0) {
      toast.error("Insufficient profit balance");
      return;
    }
    setFormData(prev => ({
      ...prev,
      profit_balance: newBalance
    }));
    setProfitAmount("");
    toast.success(`Subtracted $${amount.toFixed(2)} from profit`);
  };

  const handleAddRoi = () => {
    const amount = parseFloat(roiAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    setFormData(prev => ({
      ...prev,
      roi_balance: parseFloat(String(prev.roi_balance)) + amount
    }));
    setRoiAmount("");
    toast.success(`Added $${amount.toFixed(2)} to ROI`);
  };

  const handleSubtractRoi = () => {
    const amount = parseFloat(roiAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newBalance = parseFloat(String(formData.roi_balance)) - amount;
    if (newBalance < 0) {
      toast.error("Insufficient ROI balance");
      return;
    }
    setFormData(prev => ({
      ...prev,
      roi_balance: newBalance
    }));
    setRoiAmount("");
    toast.success(`Subtracted $${amount.toFixed(2)} from ROI`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          usd_balance: formData.usd_balance,
          btc_balance: formData.btc_balance,
          eth_balance: formData.eth_balance,
          ltc_balance: formData.ltc_balance,
          profit_balance: formData.profit_balance,
          roi_balance: formData.roi_balance,
          btc_wallet_address: formData.btc_wallet_address.trim() || null,
          eth_wallet_address: formData.eth_wallet_address.trim() || null,
          ltc_wallet_address: formData.ltc_wallet_address.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("User updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user?.username}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance Management */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>USD Balance</Label>
              <div className="text-xl font-bold text-primary">
                ${parseFloat(String(formData.usd_balance)).toFixed(2)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>BTC Balance</Label>
              <div className="text-xl font-bold text-primary">
                {parseFloat(String(formData.btc_balance)).toFixed(8)} BTC
              </div>
            </div>
            <div className="space-y-2">
              <Label>ETH Balance</Label>
              <div className="text-xl font-bold text-primary">
                {parseFloat(String(formData.eth_balance)).toFixed(8)} ETH
              </div>
            </div>
            <div className="space-y-2">
              <Label>LTC Balance</Label>
              <div className="text-xl font-bold text-primary">
                {parseFloat(String(formData.ltc_balance)).toFixed(8)} LTC
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundCurrency">Select Currency</Label>
            <Select value={fundCurrency} onValueChange={setFundCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD (Main Balance)</SelectItem>
                <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                <SelectItem value="ltc">Litecoin (LTC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundAmount">Add/Subtract {fundCurrency.toUpperCase()} Funds</Label>
            <div className="flex gap-2">
              <Input
                id="fundAmount"
                type="number"
                step={fundCurrency === "usd" ? "0.01" : "0.00000001"}
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
              <Button onClick={handleAddFunds} variant="default" size="sm">
                Add
              </Button>
              <Button onClick={handleSubtractFunds} variant="destructive" size="sm">
                Subtract
              </Button>
            </div>
          </div>

          {/* Profit Management */}
          <div className="space-y-2">
            <Label>Current Profit Balance</Label>
            <div className="text-2xl font-bold text-success">
              ${parseFloat(String(formData.profit_balance)).toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profitAmount">Add/Subtract Profit</Label>
            <div className="flex gap-2">
              <Input
                id="profitAmount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={profitAmount}
                onChange={(e) => setProfitAmount(e.target.value)}
              />
              <Button onClick={handleAddProfit} variant="default" size="sm">
                Add
              </Button>
              <Button onClick={handleSubtractProfit} variant="destructive" size="sm">
                Subtract
              </Button>
            </div>
          </div>

          {/* ROI Management */}
          <div className="space-y-2">
            <Label>Current ROI Balance</Label>
            <div className="text-2xl font-bold text-blue-500">
              ${parseFloat(String(formData.roi_balance)).toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roiAmount">Add/Subtract ROI</Label>
            <div className="flex gap-2">
              <Input
                id="roiAmount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={roiAmount}
                onChange={(e) => setRoiAmount(e.target.value)}
              />
              <Button onClick={handleAddRoi} variant="default" size="sm">
                Add
              </Button>
              <Button onClick={handleSubtractRoi} variant="destructive" size="sm">
                Subtract
              </Button>
            </div>
          </div>

          {/* Crypto Wallet Addresses */}
          <div className="space-y-2">
            <Label htmlFor="btc_wallet">BTC Wallet Address</Label>
            <Input
              id="btc_wallet"
              type="text"
              placeholder="Enter Bitcoin wallet address"
              value={formData.btc_wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, btc_wallet_address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eth_wallet">ETH Wallet Address</Label>
            <Input
              id="eth_wallet"
              type="text"
              placeholder="Enter Ethereum wallet address"
              value={formData.eth_wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, eth_wallet_address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ltc_wallet">LTC Wallet Address</Label>
            <Input
              id="ltc_wallet"
              type="text"
              placeholder="Enter Litecoin wallet address"
              value={formData.ltc_wallet_address}
              onChange={(e) => setFormData(prev => ({ ...prev, ltc_wallet_address: e.target.value }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
