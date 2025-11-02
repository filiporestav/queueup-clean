import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import phoneMockup from "@/assets/phone-mockup.png";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - Minimalistic */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Förvandla låtförfrågningar till{" "}
                  <span className="text-primary">intäkter</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Digitala jukeboxen för moderna barer.
                  <br />
                  Inga installationer. Starta på 5 minuter.
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Ingen hårdvara
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  +18% intäkter
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  5 min setup
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  size="lg" 
                  className="text-base px-8 h-12"
                >
                  Kom igång gratis
                </Button>
              </div>
            </div>

            {/* Right Visual - Clean */}
            <div className="relative">
              <div className="relative">
                <img
                  src={phoneMockup}
                  alt="QueueUp mobilgränssnitt"
                  className="w-full max-w-md mx-auto drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;