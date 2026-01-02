import { TrackingFeature, FEATURE_OPTIONS } from '@/types/animal';
import { ArrowRight } from 'lucide-react';

interface ModuleGridProps {
  enabledFeatures: TrackingFeature[];
  animalName: string;
}

export function ModuleGrid({ enabledFeatures, animalName }: ModuleGridProps) {
  const enabledModules = FEATURE_OPTIONS.filter(f => enabledFeatures.includes(f.value));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {enabledModules.map((module, index) => (
        <ModuleCard key={module.value} module={module} animalName={animalName} index={index} />
      ))}
    </div>
  );
}

interface ModuleCardProps {
  module: typeof FEATURE_OPTIONS[0];
  animalName: string;
  index: number;
}

function ModuleCard({ module, animalName, index }: ModuleCardProps) {
  // Mock data based on module type
  const mockData = getMockData(module.value);

  return (
    <div 
      className="module-card group"
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
    </div>
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
