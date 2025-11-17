import { Card } from "@/components/ui/card";
import { DollarSign, Bitcoin, Coins } from "lucide-react";

interface WalletDisplayProps {
  usdBalance: number;
  btcBalance: number;
  ethBalance: number;
  ltcBalance: number;
  profitBalance: number;
  roiBalance: number;
  btcPrice: number;
  ethPrice: number;
  ltcPrice: number;
}

const WalletDisplay = ({ usdBalance, btcBalance, ethBalance, ltcBalance, profitBalance, roiBalance, btcPrice, ethPrice, ltcPrice }: WalletDisplayProps) => {
  const btcValue = btcBalance * btcPrice;
  const ethValue = ethBalance * ethPrice;
  const ltcValue = ltcBalance * ltcPrice;
  const totalValue = usdBalance + btcValue + ethValue + ltcValue + profitBalance + roiBalance;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-foreground">Crypto Wallet</h1>
        <p className="text-muted-foreground">Total Portfolio Value: ${totalValue.toFixed(2)}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">USD Balance</span>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground break-words">
              ${usdBalance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Available USD</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">Profit Balance</span>
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground break-words">
              ${profitBalance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total Profit</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">ROI Balance</span>
            <DollarSign className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground break-words">
              ${roiBalance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Investment Returns</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">Bitcoin</span>
            <Bitcoin className="h-5 w-5 text-orange-400" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-foreground break-words">
              {btcBalance.toFixed(8)} BTC
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${btcValue.toFixed(2)} (${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/BTC)
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-teal-500/20 to-teal-600/20 border-teal-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">Ethereum</span>
            <Coins className="h-5 w-5 text-teal-400" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-foreground break-words">
              {ethBalance.toFixed(6)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${ethValue.toFixed(2)} (${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ETH)
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground font-medium">Litecoin</span>
            <Coins className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-foreground break-words">
              {ltcBalance.toFixed(4)} LTC
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${ltcValue.toFixed(2)} (${ltcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/LTC)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WalletDisplay;
