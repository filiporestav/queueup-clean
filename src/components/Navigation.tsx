import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  
  // Main navigation items - consistent across all pages
  const navItems = [
    { label: "Plattform", href: "/platform" },
    { label: "Setup", href: "/setup" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
              <img
                src={logo}
                alt="QueueUp Logo"
                className="h-7 w-auto mr-2"
              />
              <span className="text-lg font-bold text-foreground">QueueUp</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm px-3 py-2 rounded-md transition-colors ${
                  location.pathname === item.href
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                {location.pathname !== '/dashboard' && location.pathname !== '/analytics' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                )}
                {(location.pathname === '/dashboard' || location.pathname === '/analytics') && (
                  <>
                    {location.pathname === '/dashboard' && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/analytics" className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Analys
                        </Link>
                      </Button>
                    )}
                    {location.pathname === '/analytics' && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground hover:text-foreground">
                      <LogOut className="h-4 w-4" />
                      Logga ut
                    </Button>
                  </>
                )}
                {isAdmin && location.pathname !== '/admin' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Logga in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Kom igång</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50">
            <div className="py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                    location.pathname === item.href
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 pb-4 border-t border-border/50">
              <div className="flex flex-col space-y-2 px-4">
                {user ? (
                  <>
                    {location.pathname !== '/dashboard' && location.pathname !== '/analytics' && (
                      <Button variant="ghost" size="sm" className="justify-start" asChild>
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                    )}
                    {(location.pathname === '/dashboard' || location.pathname === '/analytics') && (
                      <>
                        {location.pathname === '/dashboard' && (
                          <Button variant="ghost" size="sm" className="justify-start" asChild>
                            <Link to="/analytics" className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Analys
                            </Link>
                          </Button>
                        )}
                        {location.pathname === '/analytics' && (
                          <Button variant="ghost" size="sm" className="justify-start" asChild>
                            <Link to="/dashboard">Dashboard</Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start gap-2">
                          <LogOut className="h-4 w-4" />
                          Logga ut
                        </Button>
                      </>
                    )}
                    {isAdmin && location.pathname !== '/admin' && (
                      <Button variant="outline" size="sm" className="justify-start" asChild>
                        <Link to="/admin">Admin</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link to="/auth">Logga in</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth">Kom igång</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;