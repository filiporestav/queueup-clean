import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, User, Music, QrCode, Rocket } from "lucide-react";

const OnboardingModal = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [open, setOpen] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Set up your venue profile",
      icon: User,
      completed: currentStep > 1,
    },
    {
      number: 2,
      title: "Link Music System",
      description: "Connect Spotify, Apple Music, or line-in",
      icon: Music,
      completed: currentStep > 2,
    },
    {
      number: 3,
      title: "Print QR Code",
      description: "Download and display your unique QR",
      icon: QrCode,
      completed: currentStep > 3,
    },
    {
      number: 4,
      title: "Go Live",
      description: "Start accepting song requests",
      icon: Rocket,
      completed: currentStep > 4,
    },
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      setCurrentStep(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cta" size="lg" className="text-lg px-8 py-6">
          <Rocket className="mr-2" />
          Onboard Your Venue
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-8">
            Get Started in Minutes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.completed;

              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center space-y-2 flex-1"
                >
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    }
                  `}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-sm font-medium ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Step Content */}
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-8 h-8 text-primary-foreground",
              })}
            </div>

            <h3 className="text-xl font-bold">
              {steps[currentStep - 1].title}
            </h3>

            <p className="text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>

            {/* Step-specific content */}
            {currentStep === 1 && (
              <div className="space-y-4 pt-4">
                <div className="text-sm text-left bg-muted/30 rounded-lg p-4">
                  <div className="font-medium mb-2">What we'll need:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Venue name and location</li>
                    <li>• Contact information</li>
                    <li>• Music system details</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="border border-border rounded-lg p-3 text-center hover:border-primary transition-colors">
                  <div className="font-medium">Spotify</div>
                  <div className="text-xs text-muted-foreground">
                    Most popular
                  </div>
                </div>
                <div className="border border-border rounded-lg p-3 text-center hover:border-primary transition-colors">
                  <div className="font-medium">Apple Music</div>
                  <div className="text-xs text-muted-foreground">
                    Premium quality
                  </div>
                </div>
                <div className="border border-border rounded-lg p-3 text-center hover:border-primary transition-colors">
                  <div className="font-medium">Line-in</div>
                  <div className="text-xs text-muted-foreground">
                    Any source
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 pt-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="w-24 h-24 bg-card border-2 border-dashed border-border rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Your unique QR code will appear here
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 pt-4">
                <div className="text-sm bg-primary/10 border border-primary/20 rounded-lg p-4">
                  🎉 You're all set! Your digital jukebox is ready to start
                  generating revenue.
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <Button variant="hero" onClick={nextStep}>
              {currentStep === 4 ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
