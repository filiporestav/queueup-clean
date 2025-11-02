import { QrCode, Music, CreditCard } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const HowItWorks = () => {
  const [songsPerNight, setSongsPerNight] = useState(50);
  const [avgPrice, setAvgPrice] = useState(3.5);

  const nightlyRevenue = songsPerNight * avgPrice;
  const monthlyRevenue = nightlyRevenue * 30;

  const steps = [
    {
      number: "1",
      title: "Skanna QR-koden",
      description:
        "Skanna helt enkelt QR-koden vid ditt bord med din telefons kamera",
      Icon: QrCode,
      color: "primary",
    },
    {
      number: "2",
      title: "Välj din låt",
      description:
        "Bläddra och välj vilken låt som helst från Spotifys enorma bibliotek",
      Icon: Music,
      color: "primary",
    },
    {
      number: "3",
      title: "Betala & njut",
      description:
        "Snabb betalning och din låt läggs in i kön, redo att spelas",
      Icon: CreditCard,
      color: "primary",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-card border border-border mb-6">
            <span className="text-sm font-medium text-muted-foreground">
              Enkel process
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Så här fungerar det
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tre enkla steg för att förvandla din barupplevelse
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-8 h-0.5 bg-gradient-to-r from-border to-transparent z-0"></div>
              )}

              <div className="relative bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors z-10">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary text-white-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div
                    className={`w-full h-full rounded-full border-2 border-${step.color} flex items-center justify-center bg-${step.color}/10`}
                  >
                    <step.Icon size={32} className={`text-${step.color}`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ready badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Redo på under 30 sekunder
            </span>
          </div>
        </div>
      </div>

      {/* ROI Calculator Section */}
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Beräkna din intäktspotential
            </h2>
            <p className="text-muted-foreground">
              Se hur mycket du kan tjäna med QueueUp
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 lg:p-8 shadow-sm">
            {/* Input Controls */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Låtar per natt
                  </label>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {songsPerNight}
                  </span>
                </div>
                <Slider
                  value={[songsPerNight]}
                  onValueChange={(value) => setSongsPerNight(value[0])}
                  max={200}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>200</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Genomsnittspris per låt
                  </label>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {avgPrice.toFixed(2)} kr
                  </span>
                </div>
                <Slider
                  value={[avgPrice]}
                  onValueChange={(value) => setAvgPrice(value[0])}
                  max={10}
                  min={1}
                  step={0.25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 kr</span>
                  <span>10 kr</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {songsPerNight}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Låtar/natt
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {avgPrice.toFixed(2)} kr
                  </div>
                  <div className="text-xs text-muted-foreground">Pris/låt</div>
                </div>

                <div className="col-span-2 md:col-span-1 bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {nightlyRevenue.toFixed(0)} kr
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Intäkt/natt
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Highlight */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Månatlig intäktspotential
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-1">
                  {monthlyRevenue.toFixed(0)} kr
                </div>
                <div className="text-sm text-muted-foreground">
                  Baserat på 30 dagar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
