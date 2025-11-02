import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Integritetspolicy
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
                  QueueUp värnar om din integritet. Denna policy förklarar hur vi samlar in, använder och skyddar dina personuppgifter när du använder vår tjänst.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Vilka uppgifter vi samlar in</h2>
                <p className="text-muted-foreground">Vi kan samla in följande typer av information:</p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li><strong>Kontaktinformation:</strong> Namn, e-postadress, telefonnummer</li>
                  <li><strong>Företagsinformation:</strong> Företagsnamn, adress, organisationsnummer</li>
                  <li><strong>Användningsdata:</strong> Information om hur du använder vår tjänst</li>
                  <li><strong>Teknisk information:</strong> IP-adress, enhetstyp, webbläsare</li>
                  <li><strong>Betalningsinformation:</strong> Hanteras av tredjepartstjänster</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Hur vi använder dina uppgifter</h2>
                <p className="text-muted-foreground">Vi använder dina personuppgifter för att:</p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>Tillhandahålla och förbättra vår tjänst</li>
                  <li>Hantera ditt konto och support</li>
                  <li>Behandla betalningar</li>
                  <li>Skicka viktiga meddelanden om tjänsten</li>
                  <li>Analysera användning för att förbättra funktionalitet</li>
                  <li>Uppfylla juridiska förpliktelser</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Delning av uppgifter</h2>
                <p className="text-muted-foreground">
                  Vi delar inte dina personuppgifter med tredje parter förutom:
                </p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>Med ditt uttryckliga samtycke</li>
                  <li>Med betrodda serviceleverantörer som hjälper oss att driva tjänsten</li>
                  <li>När det krävs enligt lag</li>
                  <li>För att skydda våra rättigheter eller säkerhet</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Datalagring</h2>
                <p className="text-muted-foreground">
                  Vi lagrar dina personuppgifter så länge det är nödvändigt för att tillhandahålla tjänsten eller uppfylla juridiska förpliktelser. Data lagras säkert i EU/EES-området.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Dina rättigheter</h2>
                <p className="text-muted-foreground">
                  Enligt GDPR har du rätt att:
                </p>
                <ul className="list-disc pl-6 mt-4 text-muted-foreground space-y-2">
                  <li>Få tillgång till dina personuppgifter</li>
                  <li>Rätta felaktiga uppgifter</li>
                  <li>Radera dina uppgifter</li>
                  <li>Begränsa behandling</li>
                  <li>Dataportabilitet</li>
                  <li>Invända mot behandling</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Säkerhet</h2>
                <p className="text-muted-foreground">
                  Vi implementerar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter mot obehörig åtkomst, förlust eller missbruk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Cookies</h2>
                <p className="text-muted-foreground">
                  Vi använder cookies för att förbättra din upplevelse. Se vår cookiepolicy för mer information om vilka cookies vi använder och hur du kan hantera dem.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Kontakt</h2>
                <p className="text-muted-foreground">
                  För frågor om denna integritetspolicy eller dina personuppgifter, kontakta oss på:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>E-post:</strong> privacy@queueup.ai<br />
                  <strong>Adress:</strong> Kungliga Tekniska Högskolan, 100 44 Stockholm
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

export default Privacy;