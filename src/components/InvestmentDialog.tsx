import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar, TrendingUp, Wallet, AlertCircle } from "lucide-react";

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    name: string;
    dailyRate: string;
    minInvest: string;
    maxInvest: string;
    duration: string;
    features: string[];
    color: string;
    border: string;
  } | null;
  balance: number;
  onConfirm: (days: number, amount: number) => void;
}

const InvestmentDialog = ({ open, onOpenChange, plan, balance, onConfirm }: InvestmentDialogProps) => {
  const [selectedDays, setSelectedDays] = useState(5);
  const [investmentAmount, setInvestmentAmount] = useState("");

  if (!plan) return null;

  const amount = parseFloat(investmentAmount) || 0;
  const minInvest = parseFloat(plan.minInvest.replace(/[$,]/g, ''));
  const maxInvest = parseFloat(plan.maxInvest.replace(/[$,]/g, ''));
  const dailyRate = parseFloat(plan.dailyRate.replace('%', '')) / 100;
  const projectedProfit = amount * dailyRate * selectedDays;
  const totalReturn = amount + projectedProfit;

  const isAmountValid = amount >= minInvest && amount <= maxInvest;
  const hasSufficientBalance = amount <= balance;
  const canConfirm = isAmountValid && hasSufficientBalance && amount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Investment</DialogTitle>
          <DialogDescription>
            Review your investment details and select the duration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Info */}
          <div className={`p-4 rounded-lg bg-gradient-to-br ${plan.color} ${plan.border} border-2`}>
            <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{plan.dailyRate} Daily Returns</span>
            </div>
          </div>

          {/* Current Balance */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Your Balance</Label>
            <div className="text-lg font-semibold">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Investment Amount Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Investment Amount
            </Label>
            <Input
              type="number"
              placeholder={`Min: $${minInvest.toLocaleString()} - Max: $${maxInvest.toLocaleString()}`}
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              className="text-lg"
            />
            {amount > 0 && !isAmountValid && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Amount must be between ${minInvest.toLocaleString()} and ${maxInvest.toLocaleString()}</span>
              </div>
            )}
            {amount > 0 && !hasSufficientBalance && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient balance</span>
              </div>
            )}
          </div>

          {/* Duration Slider */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Duration
            </Label>
            <div className="space-y-2">
              <Slider
                value={[selectedDays]}
                onValueChange={(value) => setSelectedDays(value[0])}
                min={5}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>5 days</span>
                <span className="font-bold text-primary text-lg">{selectedDays} days</span>
                <span>100 days</span>
              </div>
            </div>
          </div>

          {/* Projected Returns */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Daily Profit</span>
              <span className="font-semibold text-green-500">
                +${(amount * dailyRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Profit ({selectedDays} days)</span>
              <span className="font-semibold text-green-500">
                +${projectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Return</span>
              <span className="font-bold text-primary text-xl">
                ${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(selectedDays, amount)}
            disabled={!canConfirm}
          >
            Confirm Investment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDialog;
