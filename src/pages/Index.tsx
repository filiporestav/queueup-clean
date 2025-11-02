import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import VenueAdvantages from "@/components/VenueAdvantages";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <HowItWorks />
      <VenueAdvantages />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
