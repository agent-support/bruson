import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlansSection from "@/components/PlansSection";
import ProfitCalculator from "@/components/ProfitCalculator";
import ChatWidget from "@/components/ChatWidget";
import DownloadPrompt from "@/components/DownloadPrompt";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <BenefitsSection />
        <StatsSection />
        <FeaturesSection />
        <PlansSection />
        <ProfitCalculator />
      </main>
      <ChatWidget />
      <DownloadPrompt />
    </div>
  );
};

export default Index;
