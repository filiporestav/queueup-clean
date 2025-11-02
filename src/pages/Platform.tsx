import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Building2,
  Users,
  BarChart3,
  Brain,
  Smartphone,
  CreditCard,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Element } from "react-scroll";

const Platform = () => {
  const businessFeatures = [
    {
      icon: BarChart3,
      title: "Intäktspanel",
      description:
        "Följ intäkter, populära låtar, rusningtider och kundengagemang i realtid.",
      features: [
        "Intäktsuppföljning i realtid",
        "Låtpopularitetsanalys",
        "Insikter om rusningtider",
        "Kundbeteendedata",
      ],
    },
    {
      icon: Brain,
      title: "AI-driven Prissättning",
      description:
        "Dynamiska prisalgoritmer optimerar intäkter baserat på efterfrågan, tid och lokal atmosfär.",
      features: [
        "Efterfrågebaserad prissättning",
        "Tidskänsliga justeringar",
        "Lokalspecifik optimering",
        "Intäktsmaximering",
      ],
    },
    {
      icon: Building2,
      title: "Lokalhantering",
      description:
        "Fullständig kontroll över din musikupplevelse med enkel installation och anpassningsmöjligheter.",
      features: [
        "5-minuters installation",
        "Anpassad branding",
        "Integration av musikkälla",
        "Köhantering",
      ],
    },
    {
      icon: Zap,
      title: "Ingen Hårdvara",
      description:
        "Ingen utrustning behövs. Bara skriv ut en QR-kod och börja tjäna på musikönskemål omedelbart.",
      features: [
        "QR-kodsgenerering",
        "Omedelbar aktivering",
        "Inget underhåll",
        "Sömlös integration",
      ],
    },
  ];

  const userFeatures = [
    {
      icon: Smartphone,
      title: "Intuitivt Gränssnitt",
      description:
        "Vacker, snabb och responsiv design som fungerar perfekt på alla enheter.",
      features: [
        "Mobil-först design",
        "Omedelbar låtsökning",
        "Köuppdateringar i realtid",
        "Rent, modernt gränssnitt",
      ],
    },
    {
      icon: CreditCard,
      title: "Friktionsfria Betalningar",
      description:
        "Betala direkt med Apple Pay, Google Pay eller Swish. Inga appar att ladda ner, inga konton behövs.",
      features: [
        "Apple Pay-integration",
        "Google Pay-stöd",
        "Swish-betalningar",
        "Ingen registrering krävs",
      ],
    },
    {
      icon: Star,
      title: "Förbättrad Upplevelse",
      description:
        "Se din låts position i kön, uppskattad speltid, och få notiser när den snart spelas.",
      features: [
        "Köuppföljning i realtid",
        "Uppskattad speltid",
        "Dubblettförebyggande",
        "Låtnotiser",
      ],
    },
    {
      icon: Users,
      title: "Sociala Funktioner",
      description:
        "Se vad andra spelar, upptäck ny musik och bidra till lokalens atmosfär.",
      features: [
        "Aktivitetsflöde i realtid",
        "Musikupptäckt",
        "Social kövisning",
        "Gemenskapsengagemang",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            En Plattform, <span className="text-primary">Två Upplevelser</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Kraftfulla verktyg för företag att öka intäkter, och fantastiska
            upplevelser för kunder att kontrollera sin kväll.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="businesses"
              smooth={true}
              duration={500}
              className="w-full sm:w-auto"
              offset={-50}
            >
              <Button variant="hero" size="lg">
                För Företag
              </Button>
            </Link>

            <Link
              to="customers"
              smooth={true}
              duration={500}
              className="w-full sm:w-auto"
              offset={-50}
            >
              <Button variant="secondary" size="lg">
                För Kunder
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Business Platform Section */}
      <section className="py-20 bg-background" id="businesses">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">För Företag</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Förvandla ditt musiksystem till en vinstcentral med kraftfull
              analys och AI-driven optimering
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {businessFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-2xl p-8"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {feature.description}
                      </p>

                      <div className="space-y-2">
                        {feature.features.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="text-sm text-muted-foreground">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Platform Section */}
      <section className="py-20 bg-gradient-subtle" id="customers">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Users className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">För Kunder</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              En sömlös, engagerande upplevelse som ger dig kontroll över
              lokalens atmosfär
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {userFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-2xl p-8"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-secondary-foreground" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {feature.description}
                      </p>

                      <div className="space-y-2">
                        {feature.features.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                            <span className="text-sm text-muted-foreground">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Platform;
