import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";
import OnboardingModal from "./OnboardingModal";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-accent relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl lg:text-6xl font-bold text-secondary-foreground">
            Redo att förvandla musik till pengar?
          </h2>

          <p className="text-xl text-secondary-foreground/80 max-w-2xl mx-auto">
            Gå med i venues världen över som förvandlat sin musikupplevelse till en intäktsström. Installation tar mindre än 5 minuter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <OnboardingModal />

            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <ArrowRight className="mr-2" />
              Se demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-foreground mb-2">
                &lt;5min
              </div>
              <div className="text-secondary-foreground/70">
                Genomsnittlig installationstid
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-foreground mb-2">
                0 kr
              </div>
              <div className="text-secondary-foreground/70">
                Månadsavgifter eller hårdvarukostnader
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-foreground mb-2">
                24/7
              </div>
              <div className="text-secondary-foreground/70">
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
