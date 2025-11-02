import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Cookiepolicy
            </h1>
            <p className="text-muted-foreground">
              Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Vad är cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies är små textfiler som lagras på din enhet när du
                  besöker en webbplats. De hjälper webbplatsen att komma ihåg
                  dina preferenser och förbättra din användarupplevelse.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  2. Vilka cookies använder vi?
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Nödvändiga cookies
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Dessa cookies är nödvändiga för att webbplatsen ska
                      fungera korrekt och kan inte stängas av.
                    </p>
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                          <strong>Sessionscookies:</strong> Håller dig inloggad
                          under din session
                        </li>
                        <li>
                          <strong>Säkerhetscookies:</strong> Skyddar mot
                          bedrägerier och säkerhetsrisker
                        </li>
                        <li>
                          <strong>Språkpreferenser:</strong> Kommer ihåg din
                          valda språkinställning
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Funktionella cookies
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Dessa cookies förbättrar funktionaliteten och anpassningen
                      av webbplatsen.
                    </p>
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                          <strong>Användarpreferenser:</strong> Sparar dina
                          inställningar och val
                        </li>
                        <li>
                          <strong>Formulärdata:</strong> Hjälper till att fylla
                          i formulär automatiskt
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Analytiska cookies
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Dessa cookies hjälper oss att förstå hur besökare använder
                      webbplatsen.
                    </p>
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                          <strong>Google Analytics:</strong> Anonymiserad
                          användningsstatistik
                        </li>
                        <li>
                          <strong>Prestandamätning:</strong> Mäter
                          laddningstider och användarupplevelse
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Marknadsföringscookies
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      Dessa cookies används för att visa relevanta annonser och
                      mäta effektiviteten av marknadsföringskampanjer.
                    </p>
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                          <strong>Spårningspixlar:</strong> Mäter konverteringar
                          från annonser
                        </li>
                        <li>
                          <strong>Retargeting:</strong> Visar relevanta annonser
                          baserat på tidigare besök
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  3. Hur länge lagras cookies?
                </h2>
                <p className="text-muted-foreground">
                  Olika typer av cookies lagras under olika tidsperioder:
                </p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>
                    <strong>Sessionscookies:</strong> Raderas när du stänger
                    webbläsaren
                  </li>
                  <li>
                    <strong>Funktionella cookies:</strong> 1-12 månader
                  </li>
                  <li>
                    <strong>Analytiska cookies:</strong> 2 år (anonymiserade
                    efter 14 månader)
                  </li>
                  <li>
                    <strong>Marknadsföringscookies:</strong> 1-2 år
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  4. Hur hanterar du cookies?
                </h2>
                <p className="text-muted-foreground">
                  Du kan hantera cookies på flera sätt:
                </p>
                <div className="bg-secondary/20 rounded-lg p-6 mt-4">
                  <h4 className="font-semibold mb-3">I din webbläsare:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Blockera alla cookies</li>
                    <li>• Ta bort befintliga cookies</li>
                    <li>• Ställ in varningar innan cookies accepteras</li>
                  </ul>

                  <h4 className="font-semibold mb-3 mt-6">På vår webbplats:</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan när som helst ändra dina cookieinställningar genom
                    vår cookiebanner eller kontakta oss.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  5. Tredjepartscookies
                </h2>
                <p className="text-muted-foreground">
                  Vi använder vissa tredjepartstjänster som kan sätta sina egna
                  cookies:
                </p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>
                    <strong>Google Analytics:</strong> För webbplatsanalys
                  </li>
                  <li>
                    <strong>Stripe:</strong> För säker betalningshantering
                  </li>
                  <li>
                    <strong>Spotify API:</strong> För musikintegration
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">
                  6. Uppdateringar av cookiepolicyn
                </h2>
                <p className="text-muted-foreground">
                  Vi kan uppdatera denna cookiepolicy från tid till annan för
                  att återspegla ändringar i vår användning av cookies eller av
                  juridiska skäl.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Kontakt</h2>
                <p className="text-muted-foreground">
                  För frågor om vår användning av cookies, kontakta oss på:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>E-post:</strong> privacy@queue-up.se
                  <br />
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

export default Cookies;
