import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAddAnimal: () => void;
}

export function EmptyState({ onAddAnimal }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
        No Animals Added Yet
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start building your custom farm management system by adding your first animal type. 
        We'll generate a personalized dashboard just for you.
      </p>
      
      <Button variant="hero" size="xl" onClick={onAddAnimal}>
        <Plus className="w-5 h-5 mr-2" />
        Add Your First Animal
      </Button>

      {/* Floating Animal Icons */}
      <div className="relative w-full max-w-lg h-32 mt-12">
        <div className="absolute left-[10%] top-0 text-4xl opacity-30 animate-float" style={{ animationDelay: '-1s' }}>🐰</div>
        <div className="absolute left-[30%] top-8 text-3xl opacity-20 animate-float" style={{ animationDelay: '-2s' }}>🐔</div>
        <div className="absolute left-[50%] top-2 text-4xl opacity-30 animate-float" style={{ animationDelay: '-0.5s' }}>🐄</div>
        <div className="absolute left-[70%] top-6 text-3xl opacity-20 animate-float" style={{ animationDelay: '-3s' }}>🐟</div>
        <div className="absolute left-[85%] top-0 text-4xl opacity-30 animate-float" style={{ animationDelay: '-1.5s' }}>🐖</div>
      </div>
    </div>
  );
}
