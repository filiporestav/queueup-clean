import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          {/* Headline */}
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight">
              Redo att förvandla musik till pengar?
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
              Gå med i venues världen över som förvandlat sin musikupplevelse
              till en intäktsström.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="text-base px-10 h-14 rounded-full"
              onClick={() => (window.location.href = "/auth")}
            >
              Kom igång gratis
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-12 pt-8 border-t border-border/50">
            <div className="space-y-2">
              <div className="text-4xl font-bold">&lt;5min</div>
              <div className="text-sm text-muted-foreground">
                Genomsnittlig installationstid
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">0 kr</div>
              <div className="text-sm text-muted-foreground">
                Månadsavgifter eller hårdvarukostnader
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">
                Support & övervakning
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
