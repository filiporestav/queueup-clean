import { Check, ExternalLink, ArrowRight, Music, Settings, QrCode, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const Setup = () => {
  const steps = [
    {
      title: "Skapa ditt konto",
      description: "Registrera dig och fyll i din venues grundläggande information",
      icon: <Users className="h-6 w-6" />,
      details: [
        "Gå till inloggningssidan och välj 'Registrera dig'",
        "Fyll i din venue-information (namn, adress, kontaktuppgifter)",
        "Bekräfta din e-post och logga in",
      ],
      links: [
        { text: "Registrera dig här", url: "/auth", internal: true }
      ]
    },
    {
      title: "Skaffa Spotify Developer Credentials",
      description: "Skapa en Spotify app för att kunna söka och spela musik",
      icon: <Music className="h-6 w-6" />,
      details: [
        "Gå till Spotify Developer Dashboard",
        "Klicka på 'Create App'",
        "Fyll i app-namn (t.ex. 'Min Venue QueueUp')",
        "Välj 'Web API' som app-typ",
        "Acceptera Spotify Terms of Service",
        "Kopiera Client ID och Client Secret från app-inställningarna",
        "Lägg till Redirect URI: https://gfxostamwwzyvjsarwaa.supabase.co/functions/v1/spotify-callback",
      ],
      links: [
        { text: "Spotify Developer Dashboard", url: "https://developer.spotify.com/dashboard", internal: false }
      ]
    },
    {
      title: "Konfigurera din Spotify-integration",
      description: "Koppla ihop din venue med Spotify för musiksökning",
      icon: <Settings className="h-6 w-6" />,
      details: [
        "Logga in på din dashboard",
        "Gå till 'Spotify Integration' sektionen",
        "Fyll i ditt Spotify Client ID",
        "Fyll i ditt Spotify Client Secret",
        "Klicka på 'Connect to Spotify' för att auktorisera",
        "Du kommer att omdirigeras till Spotify för att godkänna åtkomst",
        "Efter godkännande kommer du tillbaka till dashboarden",
        "Verifiera att status visar 'Connected' med en grön ikon",
      ],
      links: [
        { text: "Gå till Dashboard", url: "/dashboard", internal: true }
      ]
    },
    {
      title: "Konfigurera prissättning och inställningar",
      description: "Ställ in hur mycket kunder ska betala för att köa låtar",
      icon: <Settings className="h-6 w-6" />,
      details: [
        "I dashboarden, hitta 'Venue Settings' sektionen",
        "Aktivera 'Enable Song Pricing' om du vill ta betalt",
        "Välj mellan statisk eller dynamisk prissättning:",
        "• Statisk: Fast pris per låt (t.ex. 10 kr)",
        "• Dynamisk: Priset ökar baserat på kölängd",
        "Konfigurera om låtval ska begränsas till specifik playlist",
        "Spara dina inställningar",
      ]
    },
    {
      title: "Generera och visa din QR-kod",
      description: "Skapa QR-kod som kunder kan skanna för att komma åt kön",
      icon: <QrCode className="h-6 w-6" />,
      details: [
        "I dashboarden, hitta 'QR Code' sektionen",
        "Klicka på 'Generate QR Code'",
        "Ladda ner QR-koden som bild",
        "Skriv ut och placera den synligt i din venue",
        "Kunder scannar koden för att komma till din venues kö",
        "Alternativt, dela länken direkt: queueup.se/venue/[ditt-venue-id]",
      ]
    },
    {
      title: "Testa systemet",
      description: "Kontrollera att allt fungerar innan du lanserar",
      icon: <Check className="h-6 w-6" />,
      details: [
        "Scanna din egen QR-kod med telefonen",
        "Sök efter en låt och lägg till den i kön",
        "Kontrollera att låten visas i din dashboard",
        "Testa att ändra låtstatus (spelas nu, slutförd)",
        "Verifiera att betalningar fungerar (om aktiverat)",
        "Instruera din personal om hur systemet fungerar",
      ]
    }
  ];

  const tips = [
    {
      title: "Placering av QR-kod",
      description: "Placera QR-koden på ett välsynligt ställe nära baren eller DJ-båset där kunder enkelt kan se och scanna den."
    },
    {
      title: "Prissättning",
      description: "Börja med låga priser (5-15 kr) för att uppmuntra användning. Du kan alltid höja priserna senare baserat på efterfrågan."
    },
    {
      title: "Spotify Premium",
      description: "Även om det inte är obligatoriskt för systemet, rekommenderas Spotify Premium för bästa spelupplevelse."
    },
    {
      title: "Personal träning",
      description: "Se till att din personal vet hur de använder dashboarden för att hantera kön och svara på kundfrågor."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent mb-4">
            Kom igång med QueueUp
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Följ denna steg-för-steg guide för att sätta upp QueueUp på din venue och börja ta emot låtförfrågningar från dina kunder.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                {step.icon}
              </div>
              <span className="text-sm font-medium">Steg {index + 1}</span>
            </div>
          ))}
        </div>

        {/* Setup Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 mb-6">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{detail}</span>
                    </div>
                  ))}
                </div>
                {step.links && (
                  <div className="flex flex-wrap gap-3">
                    {step.links.map((link, linkIndex) => (
                      link.internal ? (
                        <Button key={linkIndex} asChild variant="outline" size="sm">
                          <Link to={link.url} className="flex items-center gap-2">
                            {link.text}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button key={linkIndex} asChild variant="outline" size="sm">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            {link.text}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Tips Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Användbara tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="secondary">{index + 1}</Badge>
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl">Redo att börja?</CardTitle>
              <CardDescription className="text-base">
                Skapa ditt konto idag och börja ta emot låtförfrågningar inom några minuter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                  <Link to="/auth">
                    Skapa konto
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">
                    Behöver hjälp?
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Setup;