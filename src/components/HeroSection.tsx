import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-12">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                Förvandla låtförfrågningar till{" "}
                <span className="text-primary">intäkter</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
                Digitala jukeboxen för moderna barer. Inga installationer.
                Starta på 5 minuter.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button
                size="lg"
                className="text-base px-10 h-14 rounded-full"
                onClick={() => (window.location.href = "/auth")}
              >
                Kom igång gratis
              </Button>
            </div>

            {/* Features */}
            <div className="flex items-center justify-center gap-8 lg:gap-12 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Ingen hårdvara</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Ökad vinst</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>5 min setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
