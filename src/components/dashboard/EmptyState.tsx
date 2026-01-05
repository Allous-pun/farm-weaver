import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Sparkles, Building2 } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';

interface EmptyStateProps {
  onAddAnimal: () => void;
}

export function EmptyState({ onAddAnimal }: EmptyStateProps) {
  const { selectedFarm, farms, addFarm, selectFarm } = useFarm();
  const [isCreateFarmOpen, setIsCreateFarmOpen] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmLocation, setNewFarmLocation] = useState('');
  const { toast } = useToast();

  const hasFarm = farms.length > 0 && selectedFarm;

  const handleCreateFarm = () => {
    if (!newFarmName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a farm name.',
        variant: 'destructive',
      });
      return;
    }

    const newFarm = addFarm(newFarmName.trim(), newFarmLocation.trim() || undefined);
    selectFarm(newFarm.id);
    setNewFarmName('');
    setNewFarmLocation('');
    setIsCreateFarmOpen(false);
    
    toast({
      title: 'Farm created!',
      description: `${newFarmName} is ready. Now add your first animal.`,
    });
  };

  // No farm - show create farm prompt
  if (!hasFarm) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Create Your First Farm
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Before you can add animals, you need to create a farm. 
            Farms are containers that hold all your animal types and records.
          </p>
          
          <Button variant="hero" size="xl" onClick={() => setIsCreateFarmOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Farm
          </Button>

          {/* Decorative Farm Icons */}
          <div className="relative w-full max-w-lg h-32 mt-12">
            <div className="absolute left-[10%] top-0 text-4xl opacity-30 animate-float" style={{ animationDelay: '-1s' }}>🏠</div>
            <div className="absolute left-[30%] top-8 text-3xl opacity-20 animate-float" style={{ animationDelay: '-2s' }}>🌾</div>
            <div className="absolute left-[50%] top-2 text-4xl opacity-30 animate-float" style={{ animationDelay: '-0.5s' }}>🚜</div>
            <div className="absolute left-[70%] top-6 text-3xl opacity-20 animate-float" style={{ animationDelay: '-3s' }}>🌻</div>
            <div className="absolute left-[85%] top-0 text-4xl opacity-30 animate-float" style={{ animationDelay: '-1.5s' }}>🌳</div>
          </div>
        </div>

        {/* Create Farm Dialog */}
        <Dialog open={isCreateFarmOpen} onOpenChange={setIsCreateFarmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Your Farm</DialogTitle>
              <DialogDescription>
                Give your farm a name to get started. You can add more farms later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="farmName" className="text-sm font-medium">
                  Farm Name *
                </label>
                <Input
                  id="farmName"
                  placeholder="e.g., Sunny Meadows Farm"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="farmLocation" className="text-sm font-medium">
                  Location (optional)
                </label>
                <Input
                  id="farmLocation"
                  placeholder="e.g., Springfield, IL"
                  value={newFarmLocation}
                  onChange={(e) => setNewFarmLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFarmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFarm}>
                Create Farm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Has farm - show add animal prompt
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
        No Animals Added Yet
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start building your custom farm management system by adding your first animal type to <strong>{selectedFarm.name}</strong>. 
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