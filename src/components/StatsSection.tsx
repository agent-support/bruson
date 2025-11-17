const StatsSection = () => {
  const stats = [
    { value: "98.7%", label: "Success Rate", color: "text-primary" },
    { value: "$2.1M+", label: "Total Profits Generated", color: "text-success" },
    { value: "10,000+", label: "Active Traders", color: "text-secondary" },
    { value: "24/7", label: "Market Monitoring", color: "text-primary" },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="bg-gradient-stats rounded-3xl p-12 shadow-2xl">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-5xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
