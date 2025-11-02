import {
  DollarSign,
  TrendingUp,
  Heart,
  Clock,
  BarChart3,
  Users,
} from "lucide-react";

const VenueAdvantages = () => {
  const advantages = [
    {
      icon: TrendingUp,
      title: "Ökade intäkter",
      description:
        "Förvandla musikförfrågningar till en ny intäktsström. Genomsnittliga venues ser 18% ökning av nattliga intäkter utan operativa kostnader.",
      stats: "+5% genomsnittlig intäkt",
    },
    {
      icon: DollarSign,
      title: "Höga vinstmarginaler",
      description:
        "Enkel plug-and-play utan extra kostnader eller omkostnader. Pengarna går direkt till din resultat.",
      stats: "90% vinstmarginal",
    },
    {
      icon: Users,
      title: "Förbättrad kundretention",
      description:
        "Gäster stannar längre när deras låt kommer upp. Skapa förväntan och håll kunderna engagerade hela natten.",
      stats: "+30min genomsnittlig vistelse",
    },
    {
      icon: Heart,
      title: "Kundnöjdhet",
      description:
        "Ge kunderna kontroll över sin upplevelse. Nöjda kunder blir återkommande kunder och varumärkesambassadörer.",
      stats: "94% nöjdhetsgrad",
    },
    {
      icon: Clock,
      title: "Minskad personalbelastning",
      description:
        "Inga fler konstanta musikförfrågningar till personalen. Låt tekniken hantera kön medan ditt team fokuserar på service.",
      stats: "12% färre avbrott",
    },
    {
      icon: BarChart3,
      title: "Datadrivna insikter",
      description:
        "Förstå dina kunders musikpreferenser och högtrafik. Använd analyser för att optimera din venues atmosfär.",
      stats: "Realtidsanalyser",
    },
  ];

  const integrations = [
    { name: "Spotify", available: true },
    { name: "Apple Music", available: false },
    { name: "Apple Pay", available: false },
    { name: "Swish", available: false },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Varför venues väljer QueueUp
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Förvandla din musikupplevelse till en intäktsförare
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <div
                key={advantage.title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {advantage.description}
                </p>

                <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {advantage.stats}
                </div>
              </div>
            );
          })}
        </div>

        {/* Integration Badges */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Integrerar sömlöst med</p>
          <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium relative"
              >
                {integration.name}
                {!integration.available && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Kommer snart)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueAdvantages;
