import { Plus, ClipboardList, Leaf } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileFABProps {
  onAddAnimal: () => void;
  onAddRecord?: () => void;
  showAddRecord?: boolean;
}

export function MobileFAB({ onAddAnimal, onAddRecord, showAddRecord = false }: MobileFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainClick = () => {
    if (showAddRecord && onAddRecord) {
      setIsExpanded(!isExpanded);
    } else {
      onAddAnimal();
    }
  };

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-3">
      {/* Sub-actions (shown when expanded) */}
      {isExpanded && showAddRecord && (
        <>
          <button
            onClick={() => {
              onAddRecord?.();
              setIsExpanded(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full bg-secondary shadow-lg flex items-center justify-center",
              "animate-in fade-in slide-in-from-bottom-2 duration-200"
            )}
          >
            <ClipboardList className="w-5 h-5 text-secondary-foreground" />
          </button>
          <button
            onClick={() => {
              onAddAnimal();
              setIsExpanded(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full bg-secondary shadow-lg flex items-center justify-center",
              "animate-in fade-in slide-in-from-bottom-2 duration-200",
              "animation-delay-75"
            )}
          >
            <Leaf className="w-5 h-5 text-secondary-foreground" />
          </button>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={handleMainClick}
        className={cn(
          "w-14 h-14 rounded-full bg-gradient-hero shadow-lg flex items-center justify-center",
          "transition-transform duration-200 active:scale-95",
          isExpanded && "rotate-45"
        )}
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>
    </div>
  );
}