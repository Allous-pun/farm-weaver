import { useFarm } from '@/context/FarmContext';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

interface AnimalSelectorProps {
  onAddNew: () => void;
}

export function AnimalSelector({ onAddNew }: AnimalSelectorProps) {
  const { animalTypes, selectedAnimalType, selectAnimalType } = useFarm();
  const [isOpen, setIsOpen] = useState(false);

  if (animalTypes.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all min-w-[200px]"
      >
        {selectedAnimalType ? (
          <>
            <span className="text-2xl">{selectedAnimalType.icon}</span>
            <div className="text-left flex-1">
              <div className="font-medium">{selectedAnimalType.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{selectedAnimalType.category}</div>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">Select animal</span>
        )}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-popover border border-border rounded-xl shadow-lg z-50 animate-fade-in">
          {animalTypes.map((animal) => (
            <button
              key={animal.id}
              onClick={() => {
                selectAnimalType(animal.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left ${
                selectedAnimalType?.id === animal.id ? 'bg-primary/5' : ''
              }`}
            >
              <span className="text-2xl">{animal.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{animal.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{animal.category}</div>
              </div>
            </button>
          ))}
          
          <div className="border-t border-border my-2" />
          
          <button
            onClick={() => {
              onAddNew();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-primary"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Animal</span>
          </button>
        </div>
      )}
    </div>
  );
}
