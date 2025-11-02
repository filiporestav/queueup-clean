import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-auto rounded-lg flex items-center justify-center">
                <img src={logo} alt="QueueUp Logo" className="h-24 w-auto" />
              </div>
              <div className="text-xl font-bold">QueueUp</div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Återuppfinner den digitala jukeboxen på 2000-talet med AI
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Företag</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about-us" className="text-muted-foreground hover:text-primary transition-colors">Om oss</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</a></li>
              <li><a href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Juridiskt</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Villkor</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Integritetspolicy</a></li>
              <li><a href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookie-samtycke</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="text-muted-foreground hover:text-primary transition-colors">Hjälpcenter</a></li>
              <li><a href="mailto:support@queueup.ai" className="text-muted-foreground hover:text-primary transition-colors">support@queueup.ai</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} QueueUp.ai. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
