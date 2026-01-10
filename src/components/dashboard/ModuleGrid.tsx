import { TrackingFeature, FEATURE_OPTIONS } from '@/types/animal';
import { ArrowRight, Plus } from 'lucide-react';

interface ModuleGridProps {
  enabledFeatures: TrackingFeature[];
  animalName: string;
  onModuleClick?: (module: string) => void;
  onAddModules?: () => void;
}

export function ModuleGrid({ enabledFeatures, animalName, onModuleClick, onAddModules }: ModuleGridProps) {
  const enabledModules = FEATURE_OPTIONS.filter(f => enabledFeatures.includes(f.value));
  const hasDisabledModules = enabledModules.length < FEATURE_OPTIONS.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {enabledModules.map((module, index) => (
        <ModuleCard 
          key={module.value} 
          module={module} 
          animalName={animalName} 
          index={index}
          onClick={() => onModuleClick?.(module.value)}
        />
      ))}
      
      {/* Add More Modules Card */}
      {hasDisabledModules && onAddModules && (
        <button
          onClick={onAddModules}
          className="module-card group text-left w-full border-dashed border-2 border-border hover:border-primary/50 bg-muted/30"
          style={{ animationDelay: `${enabledModules.length * 0.1}s` }}
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold">Add More Modules</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Enable additional tracking features
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

interface ModuleCardProps {
  module: typeof FEATURE_OPTIONS[0];
  animalName: string;
  index: number;
  onClick?: () => void;
}

function ModuleCard({ module, animalName, index, onClick }: ModuleCardProps) {
  // Mock data based on module type
  const mockData = getMockData(module.value);

  return (
    <button 
      onClick={onClick}
      className="module-card group text-left w-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{module.icon}</span>
          <div>
            <h3 className="font-display font-semibold">{module.label}</h3>
            <p className="text-xs text-muted-foreground">{animalName}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      <div className="space-y-3">
        {mockData.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {mockData.status && (
        <div className={`mt-4 px-3 py-2 rounded-lg text-sm font-medium ${mockData.status.color}`}>
          {mockData.status.text}
        </div>
      )}
    </button>
  );
}

function getMockData(feature: TrackingFeature) {
  switch (feature) {
    case 'feed':
      return {
        items: [
          { label: 'Today\'s consumption', value: '45 kg' },
          { label: 'Feed stock', value: '250 kg' },
          { label: 'Daily avg cost', value: '$12.50' },
        ],
        status: { text: 'Stock running low in 5 days', color: 'bg-warning/10 text-warning' },
      };
    case 'health':
      return {
        items: [
          { label: 'Healthy', value: '85%' },
          { label: 'Under treatment', value: '3' },
          { label: 'Next vaccination', value: 'In 7 days' },
        ],
        status: { text: '2 checkups due today', color: 'bg-info/10 text-info' },
      };
    case 'reproduction':
      return {
        items: [
          { label: 'Pregnant', value: '8' },
          { label: 'Due this week', value: '2' },
          { label: 'Success rate', value: '78%' },
        ],
        status: { text: '2 births expected', color: 'bg-success/10 text-success' },
      };
    case 'genetics':
      return {
        items: [
          { label: 'Breeding lines', value: '4' },
          { label: 'Top performers', value: '12' },
          { label: 'Genetic diversity', value: 'High' },
        ],
      };
    case 'inventory':
      return {
        items: [
          { label: 'In stock', value: '45' },
          { label: 'Sold this month', value: '12' },
          { label: 'Revenue', value: '$1,250' },
        ],
        status: { text: '3 pending orders', color: 'bg-accent/10 text-accent' },
      };
    case 'production':
      return {
        items: [
          { label: 'Today', value: '125 units' },
          { label: 'This week', value: '820 units' },
          { label: 'Efficiency', value: '94%' },
        ],
        status: { text: 'Above monthly target', color: 'bg-success/10 text-success' },
      };
    default:
      return { items: [] };
  }
}
