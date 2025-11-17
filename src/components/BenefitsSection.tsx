import { Card } from "@/components/ui/card";
import { Headphones, TrendingUp, Zap } from "lucide-react";
import expertSupportImg from "@/assets/expert-support.jpg";
import provenTrackRecordImg from "@/assets/proven-track-record.jpg";
import automatedTradingImg from "@/assets/automated-trading.jpg";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Headphones,
      image: expertSupportImg,
      title: "Expert Support",
      description: "24/7 dedicated support from crypto trading experts to help you maximize your investment potential.",
    },
    {
      icon: TrendingUp,
      image: provenTrackRecordImg,
      title: "Proven Track Record",
      description: "Over 3 years of consistent profits with a 98.7% success rate trusted by thousands of investors.",
    },
    {
      icon: Zap,
      image: automatedTradingImg,
      title: "Automated Trading",
      description: "Set it and forget it. Our bots work around the clock to capitalize on market opportunities.",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto mb-6 relative group">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-48 h-48 mx-auto rounded-2xl object-cover shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 w-48 h-48 mx-auto rounded-2xl bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
                <h3 className="text-2xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
