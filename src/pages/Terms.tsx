import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Allmänna villkor
            </h1>
            <p className="text-muted-foreground">
              Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduktion</h2>
                <p className="text-muted-foreground">
                  Välkommen till QueueUp. Dessa allmänna villkor ("Villkor") reglerar din användning av QueueUp-plattformen och relaterade tjänster. Genom att använda våra tjänster accepterar du dessa villkor.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Tjänstebeskrivning</h2>
                <p className="text-muted-foreground">
                  QueueUp tillhandahåller en digital jukebox-plattform som möjliggör för gäster att begära musik via QR-koder och för företag att monetarisera musikförfrågningar. Tjänsten inkluderar:
                </p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>QR-kodbaserad musikbegäran</li>
                  <li>Betalningshantering</li>
                  <li>Musikköhantering</li>
                  <li>Analysdashboard för företag</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Användaransvar</h2>
                <p className="text-muted-foreground">
                  Som användare av QueueUp åtar du dig att:
                </p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>Använda tjänsten i enlighet med gällande lagar</li>
                  <li>Inte använda tjänsten för olagliga ändamål</li>
                  <li>Respektera andra användares rättigheter</li>
                  <li>Tillhandahålla korrekt information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Betalning och avgifter</h2>
                <p className="text-muted-foreground">
                  QueueUp tar ut avgifter enligt vår prislista. Alla priser anges inklusive moms där tillämpligt. Betalning sker enligt de betalningsvillkor som specificeras vid tecknandet av avtal.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Immateriella rättigheter</h2>
                <p className="text-muted-foreground">
                  QueueUp-plattformen och allt relaterat innehåll är skyddat av upphovsrätt och andra immateriella rättigheter. Du får använda tjänsten enligt dessa villkor men får inte kopiera, distribuera eller modifiera plattformen.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Ansvarsbegränsning</h2>
                <p className="text-muted-foreground">
                  QueueUp ansvarar inte för indirekta skador eller förluster som uppstår genom användning av tjänsten. Vårt totala ansvar är begränsat till de avgifter du betalat för tjänsten under de senaste 12 månaderna.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Uppsägning</h2>
                <p className="text-muted-foreground">
                  Du kan när som helst avsluta din användning av QueueUp. Vi förbehåller oss rätten att avsluta eller suspendera konton som bryter mot dessa villkor.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Ändringar av villkor</h2>
                <p className="text-muted-foreground">
                  Vi kan uppdatera dessa villkor från tid till annan. Väsentliga ändringar kommer att meddelas via e-post eller genom notifiering i tjänsten.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Kontaktinformation</h2>
                <p className="text-muted-foreground">
                  För frågor om dessa villkor, kontakta oss på hello@queueup.ai
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;