import { Plus, ClipboardList, Leaf, Wheat, Stethoscope, Baby, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface MobileFABProps {
  onAddAnimal: () => void;
  onAddRecord?: () => void;
  onQuickAction?: (actionId: string) => void;
  enabledFeatures?: string[];
  animalId?: string;
}

const QUICK_ACTIONS: Record<string, QuickAction> = {
  records: { id: 'records', label: 'Add Record', icon: ClipboardList, color: 'bg-blue-500' },
  feed: { id: 'feed', label: 'Log Feeding', icon: Wheat, color: 'bg-amber-500' },
  health: { id: 'health', label: 'Health Record', icon: Stethoscope, color: 'bg-emerald-500' },
  reproduction: { id: 'reproduction', label: 'Breeding Log', icon: Baby, color: 'bg-pink-500' },
};

export function MobileFAB({ onAddAnimal, onAddRecord, onQuickAction, enabledFeatures = [], animalId }: MobileFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Build available actions based on enabled features
  const availableActions: QuickAction[] = [
    QUICK_ACTIONS.records, // Always show add record
    ...enabledFeatures
      .filter(f => QUICK_ACTIONS[f])
      .map(f => QUICK_ACTIONS[f])
  ];

  const hasActions = animalId && availableActions.length > 0;

  const handleMainClick = () => {
    if (hasActions) {
      setIsExpanded(!isExpanded);
    } else {
      onAddAnimal();
    }
  };

  const handleActionClick = (action: QuickAction) => {
    setIsExpanded(false);
    
    if (action.id === 'records' && onAddRecord) {
      onAddRecord();
    } else if (onQuickAction) {
      onQuickAction(action.id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* Quick Actions */}
        {isExpanded && hasActions && (
          <div className="flex flex-col-reverse gap-2 mr-1">
            {/* Add Animal Type */}
            <button
              onClick={() => {
                onAddAnimal();
                setIsExpanded(false);
              }}
              className={cn(
                "flex items-center gap-3 pl-4 pr-3 py-2 rounded-full bg-card shadow-lg border border-border",
                "animate-in fade-in slide-in-from-bottom-2 duration-200"
              )}
            >
              <span className="text-sm font-medium whitespace-nowrap">New Animal Type</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
            </button>

            {/* Feature Actions */}
            {availableActions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "flex items-center gap-3 pl-4 pr-3 py-2 rounded-full bg-card shadow-lg border border-border",
                  "animate-in fade-in slide-in-from-bottom-2 duration-200"
                )}
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
              >
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", action.color)}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={handleMainClick}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
            "transition-all duration-200 active:scale-95",
            isExpanded 
              ? "bg-muted rotate-0" 
              : "bg-gradient-hero"
          )}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-muted-foreground" />
          ) : (
            <Plus className="w-6 h-6 text-primary-foreground" />
          )}
        </button>
      </div>
    </>
  );
}