import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Leaf, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        {/* Decorative Icons */}
        <div className="absolute top-20 right-[15%] text-4xl animate-float opacity-20">🐄</div>
        <div className="absolute top-40 left-[10%] text-3xl animate-float opacity-20" style={{ animationDelay: '-2s' }}>🐔</div>
        <div className="absolute bottom-32 right-[20%] text-3xl animate-float opacity-20" style={{ animationDelay: '-1s' }}>🐑</div>
        <div className="absolute bottom-20 left-[25%] text-4xl animate-float opacity-20" style={{ animationDelay: '-4s' }}>🐖</div>
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Build Your Custom Farm Management System</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up">
            <span className="text-foreground">Manage Any Animal,</span>
            <br />
            <span className="gradient-text">Your Way</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            Create a custom management system for rabbits, cattle, poultry, or any animal. 
            Define what you track, and get a powerful dashboard built just for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-2">
            <Link to="/register">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up stagger-3">
            <FeaturePill icon={<Leaf className="w-4 h-4" />} text="Any Animal Type" />
            <FeaturePill icon={<BarChart3 className="w-4 h-4" />} text="Custom Tracking" />
            <FeaturePill icon={<Sparkles className="w-4 h-4" />} text="Smart Dashboards" />
          </div>
        </div>

        {/* Preview Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-slide-up stagger-4">
          <PreviewCard
            icon="🐰"
            title="Rabbits"
            features={['Breeding cycles', 'Litter tracking', 'Growth records']}
            color="bg-primary/5"
          />
          <PreviewCard
            icon="🐄"
            title="Cattle"
            features={['Milk production', 'Health records', 'Genetics']}
            color="bg-accent/5"
            highlighted
          />
          <PreviewCard
            icon="🐔"
            title="Poultry"
            features={['Egg production', 'Flock management', 'Feed tracking']}
            color="bg-success/5"
          />
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
      {icon}
      {text}
    </div>
  );
}

function PreviewCard({
  icon,
  title,
  features,
  color,
  highlighted = false,
}: {
  icon: string;
  title: string;
  features: string[];
  color: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 ${color} border border-border/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg ${
        highlighted ? 'md:-translate-y-4 shadow-lg' : ''
      }`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-display font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
