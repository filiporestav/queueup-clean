import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  HelpCircle,
  DollarSign,
  Settings,
  Users,
  Shield,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqCategories = [
    {
      icon: DollarSign,
      title: "Intäkter & Prissättning",
      questions: [
        {
          question: "Hur mycket pengar kan min lokal realistiskt tjäna?",
          answer:
            "De flesta lokaler ser mellan 1500-5000 kr extra i nattliga intäkter beroende på storlek och kundvolym. En typisk bar med 50-100 kunder per kväll har i genomsnitt 2500 kr i musikintäkter. Toppkvällar (helger, evenemang) kan generera 4000-6000 kr. Kom ihåg att detta är 100% vinstmarginal med noll driftskostnader.",
        },
        {
          question: "Hur fungerar prissättningen för kunder?",
          answer:
            "Vi använder AI-driven dynamisk prissättning som justerar baserat på efterfrågan, tid på dagen och lokal atmosfär. Priserna varierar vanligtvis från 20-80 kr per låt. Lugn tisdagskväll? Låtar kan vara 20-30 kr. Fullsatt fredagskväll? Populära låtar kan vara 50-80 kr. Kunderna ser exakt pris innan köp, och dubblettförebyggande säkerställer att ingen betalar för en låt som redan finns i kön.",
        },
        {
          question: "Tar ni en procentandel av intäkterna?",
          answer:
            "Ingen intäktsdelning som standard! Du behåller 100% av vad kunderna betalar för låtar. Vi tar en enkel månadsprenumeration baserad på din lokals storlek. Detta innebär att varje låtköp går direkt till din vinst.",
        },
        {
          question: "Vad kostar månadsprenumerationen?",
          answer:
            "Planerna börjar på 490 kr/månad för små lokaler (upp till 50 kunder), 990 kr/månad för medelstora lokaler (50-150 kunder), och 1990 kr/månad för stora lokaler (150+ kunder). Alla planer inkluderar obegränsade låtar, full analys och 24/7 support. Inga installationsavgifter, inga dolda kostnader.",
        },
      ],
    },
    {
      icon: Settings,
      title: "Installation & Teknik",
      questions: [
        {
          question: "Hur snabbt kan vi komma igång?",
          answer:
            "De flesta lokaler är live inom 5 minuter! Processen är: 1) Registrera dig och konfigurera din lokalprofil, 2) Anslut ditt Spotify/Apple Music-konto, 3) Skriv ut QR-koderna vi genererar, 4) Placera dem runt din lokal. Ingen hårdvaruinstallation, ingen teknisk expertis krävs.",
        },
        {
          question: "Vilka musiktjänster integrerar ni med?",
          answer:
            "Vi integrerar med Spotify, Apple Music och kan arbeta med vilken line-in ljudkälla som helst. Ditt befintliga ljudsystem fungerar perfekt - QueueUp berättar helt enkelt vad som ska spelas härnäst genom vår instrumentpanel. Vi lägger till fler plattformar baserat på kundernas efterfrågan.",
        },
        {
          question: "Behöver vi ny hårdvara eller utrustning?",
          answer:
            "Ingen hårdvara krävs! QueueUp är 100% mjukvarubaserat. Du behöver bara: ditt befintliga ljudsystem, en enhet för att visa vår instrumentpanel (surfplatta/telefon/dator) och internetanslutning. Vi tillhandahåller QR-koder att skriva ut och placera runt din lokal.",
        },
        {
          question: "Vad händer om internet går ner?",
          answer:
            "QueueUp fungerar offline för befintliga köer. Din nuvarande spellista fortsätter spela även utan internet. När anslutningen återvänder synkroniseras nya förfrågningar automatiskt. Vi tillhandahåller också backup QR-koder och 24/7 teknisk support.",
        },
      ],
    },
    {
      icon: Users,
      title: "Kundupplevelse",
      questions: [
        {
          question: "Behöver kunderna ladda ner en app?",
          answer:
            "Ingen app krävs! Kunderna skannar helt enkelt QR-koden med sin telefons kamera och får omedelbart tillgång till din lokals musikkö genom sin webbläsare. Det fungerar på alla smartphones - iPhone, Android, allt med kamera och internet.",
        },
        {
          question: "Hur fungerar betalningar för kunder?",
          answer:
            "Superenkelt! Kunder kan betala med Apple Pay, Google Pay, Swish eller vilket större kreditkort som helst. Betalning sker omedelbart när de väljer en låt. Ingen kontoregistrering, inga sparade betalmetoder - bara tryck, betala och deras låt går med i kön.",
        },
        {
          question: "Vad förhindrar dubbletlåtar eller olämpligt innehåll?",
          answer:
            "Vårt system förhindrar automatiskt dubbletter - om en låt redan finns i kön ser kunderna att den är otillgänglig och kan välja något annat. Du har full kontroll över filter för explicit innehåll och kan skapa anpassade blockeringslistor. Du kan också moderera kön i realtid genom din instrumentpanel.",
        },
        {
          question: "Hur vet kunderna när deras låt kommer att spelas?",
          answer:
            "Kunderna ser sin låts position i kön och uppskattad speltid. De får notiser när deras låt flyttas upp och kan följa live-kön på sin telefon. Detta skapar förväntan och håller folk engagerade längre.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Säkerhet & Kontroll",
      questions: [
        {
          question: "Vilken kontroll har vi över musiken?",
          answer:
            "Fullständig kontroll! Du kan hoppa över låtar, omorganisera kön, blockera specifika spår eller artister och pausa systemet när som helst. Ställ in filter för explicit innehåll, skapa lokalanpassade spellistor för lugna perioder och åsidosätt med din egen musik när det behövs.",
        },
        {
          question: "Hur säkert är betalningssystemet?",
          answer:
            "Betalningar hanteras genom Stripe, samma system som används av företag som Shopify och Lyft. Vi lagrar aldrig kundens betalningsinformation. Alla transaktioner är krypterade och PCI DSS-kompatibla. Du får betalningar direkt till ditt företagskonto.",
        },
        {
          question: "Vad händer under livemusik eller evenemang?",
          answer:
            "Du kan omedelbart inaktivera QueueUp med ett tryck när livemusik startar, eller sätta 'Event Mode' för att pausa låtförfrågningar. Systemet kommer ihåg var du slutade och kan återuppta efter ditt evenemang. Många lokaler använder det för förspelsperioder och pauser.",
        },
        {
          question: "Kan vi anpassa gränssnittet för vårt varumärke?",
          answer:
            "Ja! Du kan ladda upp din logotyp, välja färger som matchar din lokal och anpassa välkomstmeddelandet som kunderna ser. QR-koderna kan stilas för att matcha din inredning, och du kan lägga till anpassade villkor eller policyer.",
        },
      ],
    },
    {
      icon: Zap,
      title: "Affärsverksamhet",
      questions: [
        {
          question: "Hur påverkar detta vår personals arbetsbelastning?",
          answer:
            "QueueUp minskar personalavbrott med 50% eller mer. Inga fler ständiga förfrågningar om att 'spela något annat' eller 'höj musiken'. Personalen kan fokusera på att betjäna kunder medan QueueUp hanterar musikförfrågningar automatiskt. Instrumentpanelen är enkel nog för vilken teammedlem som helst att övervaka.",
        },
        {
          question: "Vilken analys och insikter får vi?",
          answer:
            "Omfattande analys inkluderar: intäkter per kväll/vecka/månad, mest populära låtar och artister, topptider för förfrågningar, kundengagemangsmönster och demografiska insikter. Använd denna data för att optimera prissättning, planera evenemang och förstå dina kunders musikpreferenser.",
        },
        {
          question: "Kan vi köra specialerbjudanden eller rabatter?",
          answer:
            "Absolut! Ställ in happy hour-priser, skapa tematiska musikkvällar med rabatterade låtar, eller kör kampanjer som 'Gratis låt med varje cocktail'. Du kontrollerar all prissättning och kan ändra den omedelbart genom din instrumentpanel.",
        },
        {
          question: "Vilken support erbjuder ni?",
          answer:
            "24/7 teknisk support via chatt och e-post, dedikerad onboarding-specialist, regelbundna check-ins för att optimera din installation och en omfattande kunskapsbas. Vi tillhandahåller också marknadsföringsmaterial för att hjälpa till att marknadsföra tjänsten till dina kunder.",
        },
      ],
    },
    {
      icon: HelpCircle,
      title: "Komma Igång",
      questions: [
        {
          question: "Kan vi prova innan vi bestämmer oss?",
          answer:
            "Ja! Vi erbjuder en 14-dagars gratis provperiod med full tillgång till alla funktioner. Inget kreditkort krävs för att börja. Vi hjälper dig att sätta upp och tillhandahåller även exempel QR-koder så att du kan testa allt innan du fattar några beslut.",
        },
        {
          question: "Har ni referenser från andra lokaler?",
          answer:
            "Absolut! Vi arbetar med 50+ lokaler över hela Sverige inklusive cocktailbarer, sportbarer, restauranger och evenemangslokaler. Vi kan koppla dig till lokalägare i liknande situationer som kan dela sina erfarenheter och resultat.",
        },
        {
          question: "Vad händer om våra kunder inte förstår hur man använder det?",
          answer:
            "Systemet är otroligt intuitivt - de flesta kunder förstår det omedelbart. Vi tillhandahåller bordsskyltar och posters som förklarar hur det fungerar, och din personal kan enkelt visa de första kunderna. När några börjar använda det följer andra naturligt. Vi tillhandahåller också utbildningsmaterial för ditt team.",
        },
        {
          question: "Hur marknadsför vi denna nya tjänst till kunder?",
          answer:
            "Vi tillhandahåller marknadsföringsmallar, sociala medier-tillgångar och kampanjmaterial. De flesta lokaler tillkännager det bara på sina sociala medier och sätter upp våra tillhandahållna skyltar. Ordet sprids snabbt när kunderna provat det - upplevelsen säljer sig själv. Vi hjälper också med lanseringsstrategier och kampanjprissättning.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Vanliga <span className="text-primary">Frågor</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Allt lokalägare behöver veta om att implementera QueueUp och
            maximera intäkter från musikförfrågningar.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.title}
                  className="bg-card border border-border rounded-2xl p-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold">{category.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${categoryIndex}-${index}`}
                        className="border border-border rounded-lg px-6"
                      >
                        <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Har du fortfarande frågor?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Vårt team är här för att hjälpa dig förstå hur QueueUp kan fungera för
            din specifika lokal och affärsmodell.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-2">Boka en Demo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Se QueueUp i action med en personlig demo för din typ av lokal
              </p>
              <a
                href="/contact"
                className="text-primary font-semibold hover:underline"
              >
                Boka Demo →
              </a>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-2">Prata med Lokaler</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kontakta andra lokalägare som redan använder QueueUp
                framgångsrikt
              </p>
              <a
                href="/contact"
                className="text-primary font-semibold hover:underline"
              >
                Få Referenser →
              </a>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold mb-2">Gratis Provperiod</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Prova QueueUp riskfritt i 14 dagar med full support och
                installationshjälp
              </p>
              <a
                href="/contact"
                className="text-primary font-semibold hover:underline"
              >
                Starta Provperiod →
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Kontakta Säljteamet
            </a>
            <a
              href="/platform"
              className="border border-border bg-transparent px-8 py-3 rounded-lg font-semibold hover:bg-card transition-colors"
            >
              Läs Mer
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
