import PricingCards from "./PricingCards";

const PlansSection = () => {
  return (
    <section id="plans" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Choose Your <span className="text-primary">Trading</span>{" "}
            <span className="text-secondary">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Select the perfect plan for your investment goals. All plans include our advanced AI 
            trading algorithms and 24/7 support.
          </p>
        </div>
        <PricingCards />
      </div>
    </section>
  );
};

export default PlansSection;
