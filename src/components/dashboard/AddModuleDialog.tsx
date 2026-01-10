import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { TrackingFeature, FEATURE_OPTIONS, AnimalType } from '@/types/animal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
}

export function AddModuleDialog({ isOpen, onClose, animalType }: AddModuleDialogProps) {
  const { updateAnimalType } = useFarm();
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<TrackingFeature[]>([]);

  const disabledModules = FEATURE_OPTIONS.filter(
    (f) => !animalType.features.includes(f.value)
  );

  const handleToggleModule = (module: TrackingFeature) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const handleAddModules = () => {
    if (selectedModules.length === 0) {
      toast({
        title: 'No modules selected',
        description: 'Please select at least one module to add.',
        variant: 'destructive',
      });
      return;
    }

    const updatedFeatures = [...animalType.features, ...selectedModules];
    updateAnimalType(animalType.id, { features: updatedFeatures });

    toast({
      title: 'Modules added',
      description: `${selectedModules.length} module(s) have been enabled for ${animalType.name}.`,
    });

    setSelectedModules([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedModules([]);
    onClose();
  };

  if (disabledModules.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>All Modules Enabled</DialogTitle>
            <DialogDescription>
              All available modules are already enabled for {animalType.name}.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Modules to {animalType.name}
          </DialogTitle>
          <DialogDescription>
            Select additional modules to enable for this animal type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {disabledModules.map((module) => (
            <label
              key={module.value}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedModules.includes(module.value)}
                onCheckedChange={() => handleToggleModule(module.value)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{module.icon}</span>
                  <span className="font-medium">{module.label}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {module.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAddModules} className="flex-1">
            Add {selectedModules.length > 0 ? `(${selectedModules.length})` : ''} Modules
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}