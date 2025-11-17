import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const PricingCards = () => {
  const plans = [
    {
      name: "Basic Plan",
      description: "Perfect for beginners looking to start their crypto trading journey",
      dailyReturn: "5%",
      investmentRange: "$100 - $999",
      features: [
        "AI-Powered Trading",
        "24/7 Support",
        "Real-time Analytics",
        "Daily Returns",
      ],
      popular: false,
    },
    {
      name: "Standard Plan",
      description: "Advanced trading strategies for experienced traders",
      dailyReturn: "10%",
      investmentRange: "$1,000 - $9,999",
      features: [
        "AI-Powered Trading",
        "24/7 Support",
        "Real-time Analytics",
        "Daily Returns",
        "Priority Support",
      ],
      popular: true,
    },
    {
      name: "Premium Plan",
      description: "Exclusive high-yield trading opportunities for serious investors",
      dailyReturn: "15%",
      investmentRange: "$10,000+",
      features: [
        "AI-Powered Trading",
        "24/7 Support",
        "Real-time Analytics",
        "Daily Returns",
        "Priority Support",
        "Advanced Strategies",
        "Personal Account Manager",
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative p-6 hover:shadow-2xl transition-all duration-300 ${
              plan.popular ? "border-2 border-primary shadow-xl scale-105" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-4 py-1">
                Most Popular
              </Badge>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="py-4 border-y">
                <div className="text-4xl font-bold text-success mb-1">
                  {plan.dailyReturn}
                </div>
                <div className="text-sm text-muted-foreground">Daily Returns</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Investment Range</span>
                  <span className="font-semibold">{plan.investmentRange}</span>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "gradient" : "outline"}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          All plans include a 7-day money-back guarantee and free trading bot access
        </p>
        <Button variant="link" className="text-primary font-semibold">
          Compare All Features
        </Button>
      </div>
    </div>
  );
};

export default PricingCards;
