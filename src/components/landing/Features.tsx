import { 
  Layers, 
  Sliders, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap 
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Any Animal Type',
    description: 'Add rabbits, cattle, fish, bees, or any animal you manage. The system adapts to your needs.',
  },
  {
    icon: Sliders,
    title: 'Custom Modules',
    description: 'Enable only what you need: feeding, health, reproduction, sales, or production tracking.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Get instant insights with auto-generated dashboards tailored to your animal types.',
  },
  {
    icon: Shield,
    title: 'Offline Ready',
    description: 'Works without internet. Your data syncs automatically when you\'re back online.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Designed for the field. Use it on any device, anywhere on your farm.',
  },
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'No complex configuration. Add an animal type and start managing in seconds.',
  },
];

export function Features() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Built for Modern Farmers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Flexible, powerful, and easy to use. Everything you need to manage your farm efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div 
      className="group relative bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
