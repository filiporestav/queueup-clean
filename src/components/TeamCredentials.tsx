import nusLogo from "@/assets/logos/nus-logo.png";
import goldmanLogo from "@/assets/logos/goldman-logo.png";
import kthLogo from "@/assets/logos/kth-logo.png";
import ntuLogo from "@/assets/logos/ntu-logo.png";
import stanfordLogo from "@/assets/logos/stanford-logo.png";

const TeamCredentials = () => {
  const credentials = [
    { name: "NUS", logo: nusLogo },
    { name: "Goldman Sachs", logo: goldmanLogo },
    { name: "KTH", logo: kthLogo },
    { name: "NTU", logo: ntuLogo },
    { name: "Stanford", logo: stanfordLogo },
  ];

  return (
    <section className="py-16 bg-background border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Skapad av personer från{" "}
              <span className="text-primary">NUS, Goldman, KTH, NTU och Stanford</span>
            </h3>
            <p className="text-lg text-muted-foreground">
              15+ års kombinerad tech-erfarenhet
            </p>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 items-center justify-items-center">
            {credentials.map((credential, index) => (
              <div
                key={credential.name}
                className="flex items-center justify-center w-full h-20 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={credential.logo}
                  alt={`${credential.name} logo`}
                  className="max-w-full max-h-full object-contain px-2"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamCredentials;
