import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Calendar, Shield, Wallet } from "lucide-react";

interface ProfileData {
  email: string;
  username: string;
  role: string;
  full_name: string;
  country: string;
  created_at: string;
  usd_balance: number;
  btc_balance: number;
  eth_balance: number;
  ltc_balance: number;
  profit_balance: number;
  roi_balance: number;
  btc_wallet_address: string | null;
  eth_wallet_address: string | null;
  ltc_wallet_address: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile({
          email: user.email || "",
          username: profileData.username || "",
          role: profileData.role || "Crypto Trader",
          full_name: profileData.full_name || "",
          country: profileData.country || "",
          created_at: user.created_at || "",
          usd_balance: profileData.usd_balance || 0,
          btc_balance: profileData.btc_balance || 0,
          eth_balance: profileData.eth_balance || 0,
          ltc_balance: profileData.ltc_balance || 0,
          profit_balance: profileData.profit_balance || 0,
          roi_balance: profileData.roi_balance || 0,
          btc_wallet_address: profileData.btc_wallet_address,
          eth_wallet_address: profileData.eth_wallet_address,
          ltc_wallet_address: profileData.ltc_wallet_address,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);


  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">View your account details and registration information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{profile.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{profile.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Information */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">USD Balance</span>
              <span className="font-bold text-lg">${profile.usd_balance?.toLocaleString() || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profit Balance</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                ${profile.profit_balance?.toLocaleString() || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">BTC Balance</span>
              <span className="font-medium">{profile.btc_balance || 0} BTC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ETH Balance</span>
              <span className="font-medium">{profile.eth_balance || 0} ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">LTC Balance</span>
              <span className="font-medium">{profile.ltc_balance || 0} LTC</span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Addresses */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">BTC Wallet Address</p>
              <p className="font-mono text-sm bg-muted/50 p-2 rounded break-all">
                {profile.btc_wallet_address || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">ETH Wallet Address</p>
              <p className="font-mono text-sm bg-muted/50 p-2 rounded break-all">
                {profile.eth_wallet_address || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">LTC Wallet Address</p>
              <p className="font-mono text-sm bg-muted/50 p-2 rounded break-all">
                {profile.ltc_wallet_address || 'Not set'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
