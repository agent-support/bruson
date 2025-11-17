import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, Users, Award, Clock } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Advanced AI Trading",
      description: "Our proprietary AI algorithms analyze market patterns 24/7 to maximize your profits with precision trading strategies.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds and data are protected with military-grade encryption and multi-layer security protocols.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
    },
    {
      icon: Users,
      title: "Expert Support Team",
      description: "Get help from experienced crypto traders available around the clock to guide your investment journey.",
    },
    {
      icon: Award,
      title: "Proven Performance",
      description: "Track record of consistent returns with transparent reporting and verified trading results.",
    },
    {
      icon: Clock,
      title: "24/7 Monitoring",
      description: "Never miss an opportunity with continuous market surveillance and automated trade execution.",
    },
  ];

  return (
    <section id="about" className="py-20 px-4 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">Brunson</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We've revolutionized crypto trading with cutting-edge technology, making 
            professional-grade trading accessible to everyone. Join thousands of successful traders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-feature flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
