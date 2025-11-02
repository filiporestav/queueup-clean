import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, MessageCircle, Phone, Mail, Clock } from "lucide-react";

const Help = () => {
  const categories = [
    {
      title: "Komma igång",
      icon: BookOpen,
      articles: [
        "Så sätter du upp QueueUp på din bar",
        "Skapa ditt första QR-kodssystem",
        "Konfigurera betalningar och prissättning",
        "Integrera med Spotify eller Apple Music"
      ]
    },
    {
      title: "Betalningar och prissättning",
      icon: MessageCircle,
      articles: [
        "Så fungerar dynamisk prissättning",
        "Hantera betalningsmetoder",
        "Förstå intäktsrapporter",
        "Sätta upp rabatter och kampanjer"
      ]
    },
    {
      title: "Teknisk support",
      icon: Phone,
      articles: [
        "Felsöka vanliga problem",
        "QR-koder fungerar inte",
        "Musikintegration fungerar inte",
        "Problem med betalningar"
      ]
    },
    {
      title: "Konto och fakturering",
      icon: Mail,
      articles: [
        "Hantera ditt konto",
        "Förstå din faktura",
        "Uppgradera eller nedgradera plan",
        "Avsluta ditt konto"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Hjälpcenter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Hitta svar på dina frågor eller kontakta oss för personlig support
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="Sök efter hjälp..." 
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category, index) => (
              <div key={index} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <category.icon className="text-primary" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Behöver du mer hjälp?</h2>
              <p className="text-muted-foreground">
                Vårt supportteam finns här för att hjälpa dig
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chatta med oss direkt för snabb hjälp
                </p>
                <Button variant="outline" size="sm">Starta chat</Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">E-post</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Skicka oss ett mejl så svarar vi inom 24h
                </p>
                <Button variant="outline" size="sm">
                  <a href="mailto:support@queueup.ai">Skicka mejl</a>
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Telefon</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ring oss för akut support
                </p>
                <Button variant="outline" size="sm">
                  <a href="tel:+46701234567">+46 70 123 45 67</a>
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Support: Måndag-Fredag 09:00-17:00 (CET)</span>
              </div>
            </div>
          </div>

          {/* Popular Articles */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Populära artiklar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Sätta upp QueueUp på 5 minuter",
                "Maximera intäkter med dynamisk prissättning",
                "Integrera med befintligt ljudsystem",
                "Hantera köer under högtrafik",
                "Förstå dina analyser och rapporter",
                "Bästa praxis för prissättning"
              ].map((article, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <h3 className="font-medium mb-2">{article}</h3>
                  <p className="text-sm text-muted-foreground">
                    Läs mer om hur du kan optimera din upplevelse med QueueUp.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;