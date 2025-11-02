import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const contactSchema = z.object({
  venue_name: z.string().min(2, "Vänligen ange ett giltigt namn på lokalen"),
  contact_name: z.string().min(2, "Vänligen ange ditt namn"),
  email: z.string().email("Vänligen ange en giltig e-postadress"),
  phone: z.string().optional(),
  physical_address: z.string().optional(),
  current_music_system: z.string().optional(),
  customer_count_estimate: z.string().optional(),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      venue_name: "",
      contact_name: "",
      email: "",
      phone: "",
      physical_address: "",
      current_music_system: "",
      customer_count_estimate: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const { error } = await supabase.functions.invoke('contact-request', {
        body: data
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Tack för ditt meddelande!",
        description: "Vi kommer att kontakta dig inom 24 timmar.",
      });
      form.reset();
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte skicka meddelandet. Försök igen.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-primary" size={32} />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Tack för ditt intresse!
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Vi har tagit emot ditt meddelande och kommer att kontakta dig inom 24 timmar för att diskutera hur QueueUp kan hjälpa din lokal att öka intäkter och kundnöjdhet.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Skicka ett till meddelande
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Intresserad av QueueUp för din lokal?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upptäck hur QueueUp kan öka dina intäkter med upp till 30% genom interaktiv musikupplevelse och kundengagemang.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-2">Få en kostnadsfri konsultation</h2>
              <p className="text-muted-foreground mb-6">
                Berätta om din lokal så visar vi hur QueueUp kan passa er verksamhet.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="venue_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokalens namn *</FormLabel>
                          <FormControl>
                            <Input placeholder="Namnet på din restaurang/bar/café" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ditt namn *</FormLabel>
                          <FormControl>
                            <Input placeholder="För- och efternamn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-post *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="din@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="+46 70 123 45 67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="physical_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adress</FormLabel>
                        <FormControl>
                          <Input placeholder="Gata, stad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="current_music_system"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nuvarande musiksystem</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Välj system" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="apple-music">Apple Music</SelectItem>
                              <SelectItem value="radio">Radio</SelectItem>
                              <SelectItem value="dj">DJ/Live musik</SelectItem>
                              <SelectItem value="other">Annat</SelectItem>
                              <SelectItem value="none">Inget system</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_count_estimate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antal kunder per dag</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Uppskatta antal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-50">0-50 kunder</SelectItem>
                              <SelectItem value="50-100">50-100 kunder</SelectItem>
                              <SelectItem value="100-200">100-200 kunder</SelectItem>
                              <SelectItem value="200+">200+ kunder</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meddelande</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Berätta mer om er verksamhet och vad ni hoppas uppnå med QueueUp..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Skickar..." : "Få kostnadsfri konsultation"}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Benefits & Contact Info */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Fördelar med QueueUp</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold">Öka intäkter med 20-30%</h3>
                      <p className="text-muted-foreground text-sm">Kunder betalar för att önska musik och kommer oftare</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold">Förbättrad kundupplevelse</h3>
                      <p className="text-muted-foreground text-sm">Interaktiv musikupplevelse som engagerar gästerna</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold">Enkel installation</h3>
                      <p className="text-muted-foreground text-sm">Upp och igång på mindre än 30 minuter</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold">Detaljerad analys</h3>
                      <p className="text-muted-foreground text-sm">Få insikter om era gästers musikpreferenser</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Kontaktinformation</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">E-post</h3>
                      <p className="text-muted-foreground">hello@queueup.ai</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telefon</h3>
                      <p className="text-muted-foreground">+46 70 123 45 67</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Svarstider</h3>
                      <p className="text-muted-foreground">
                        Vi svarar inom 24 timmar<br />
                        Måndag - Fredag: 09:00 - 17:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;