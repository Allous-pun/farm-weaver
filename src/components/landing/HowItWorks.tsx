import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Add Your Animal',
    description: 'Enter the animal type you want to manage and select its category.',
    icon: '➕',
  },
  {
    number: '02',
    title: 'Choose Features',
    description: 'Select which modules you need: health, breeding, inventory, production.',
    icon: '✓',
  },
  {
    number: '03',
    title: 'Customize Terms',
    description: 'Define your terminology: what you call young, males, females, and births.',
    icon: '✏️',
  },
  {
    number: '04',
    title: 'Start Managing',
    description: 'Your personalized dashboard is ready. Add records and track everything.',
    icon: '🚀',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes. No complex setup required.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
  index,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
  index: number;
}) {
  return (
    <div className="relative group">
      <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-primary mb-1">{number}</div>
          <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      
      {/* Connector Arrow (hidden on last item and mobile) */}
      {index < 3 && (
        <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30">
          <ArrowRight className="w-8 h-8" />
        </div>
      )}
    </div>
  );
}
