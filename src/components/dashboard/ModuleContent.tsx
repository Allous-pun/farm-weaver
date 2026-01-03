import { AnimalType, TrackingFeature, FEATURE_OPTIONS } from '@/types/animal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Wheat, 
  Stethoscope, 
  Baby, 
  Dna, 
  Package, 
  BarChart3,
  Plus,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ModuleContentProps {
  module: string;
  animalType: AnimalType;
}

const MODULE_CONFIG: Record<string, { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color: string;
}> = {
  records: { 
    icon: ClipboardList, 
    title: 'Animal Records', 
    description: 'Manage individual animal records, track details, and monitor status.',
    color: 'text-primary'
  },
  feed: { 
    icon: Wheat, 
    title: 'Feed Management', 
    description: 'Track feeding schedules, consumption, and manage feed inventory.',
    color: 'text-amber-500'
  },
  health: { 
    icon: Stethoscope, 
    title: 'Health & Vaccinations', 
    description: 'Monitor health records, schedule vaccinations, and track treatments.',
    color: 'text-rose-500'
  },
  reproduction: { 
    icon: Baby, 
    title: 'Reproduction', 
    description: 'Track breeding cycles, pregnancies, and birth records.',
    color: 'text-pink-500'
  },
  genetics: { 
    icon: Dna, 
    title: 'Genetics & Breeding', 
    description: 'Manage genetic lines, pedigrees, and breeding programs.',
    color: 'text-violet-500'
  },
  inventory: { 
    icon: Package, 
    title: 'Inventory & Sales', 
    description: 'Track stock levels, sales records, and revenue.',
    color: 'text-blue-500'
  },
  production: { 
    icon: BarChart3, 
    title: 'Production', 
    description: 'Monitor production outputs like milk, eggs, or meat.',
    color: 'text-emerald-500'
  },
};

export function ModuleContent({ module, animalType }: ModuleContentProps) {
  const config = MODULE_CONFIG[module];
  
  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Module not found</p>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center ${config.color}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{config.title}</h1>
            <p className="text-muted-foreground">
              {animalType.name} • {config.description}
            </p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          icon={Calendar}
          label="This Week"
          value={getModuleStats(module).thisWeek}
        />
        <QuickStatCard
          icon={TrendingUp}
          label="Trend"
          value={getModuleStats(module).trend}
          trend="up"
        />
        <QuickStatCard
          icon={AlertCircle}
          label="Alerts"
          value={getModuleStats(module).alerts}
          alert={getModuleStats(module).alerts !== '0'}
        />
        <QuickStatCard
          icon={ClipboardList}
          label="Total Records"
          value={getModuleStats(module).total}
        />
      </div>

      {/* Module-specific content placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent {config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getModulePlaceholderData(module, animalType.name).map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
                    {animalType.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  alert 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  trend?: 'up' | 'down';
  alert?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          alert ? 'bg-destructive/10 text-destructive' : 'bg-muted'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-lg font-bold ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : ''
          }`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function getModuleStats(module: string) {
  const stats: Record<string, { thisWeek: string; trend: string; alerts: string; total: string }> = {
    records: { thisWeek: '12 added', trend: '+15%', alerts: '0', total: '145' },
    feed: { thisWeek: '245 kg', trend: '+8%', alerts: '1', total: '42' },
    health: { thisWeek: '8 checkups', trend: '-5%', alerts: '2', total: '89' },
    reproduction: { thisWeek: '3 births', trend: '+12%', alerts: '1', total: '34' },
    genetics: { thisWeek: '2 updates', trend: '0%', alerts: '0', total: '18' },
    inventory: { thisWeek: '15 sold', trend: '+22%', alerts: '0', total: '156' },
    production: { thisWeek: '820 units', trend: '+18%', alerts: '0', total: '2.4k' },
  };
  return stats[module] || stats.records;
}

function getModulePlaceholderData(module: string, animalName: string) {
  const baseData = [
    { title: `${animalName} #1`, subtitle: 'Record updated', value: 'Active', date: 'Today' },
    { title: `${animalName} #4`, subtitle: 'New entry', value: 'Pending', date: 'Yesterday' },
    { title: `${animalName} #7`, subtitle: 'Status changed', value: 'Complete', date: '2 days ago' },
  ];

  switch (module) {
    case 'health':
      return [
        { title: 'Vaccination - Group A', subtitle: '12 animals', value: 'Complete', date: 'Today' },
        { title: 'Health Check', subtitle: `${animalName} #5`, value: 'Scheduled', date: 'Tomorrow' },
        { title: 'Treatment', subtitle: `${animalName} #3`, value: 'In Progress', date: '2 days ago' },
      ];
    case 'reproduction':
      return [
        { title: 'Birth Event', subtitle: '3 kits born', value: 'Healthy', date: 'Today' },
        { title: 'Breeding', subtitle: `${animalName} #8 & #12`, value: 'Success', date: 'Yesterday' },
        { title: 'Pregnancy Check', subtitle: `${animalName} #6`, value: 'Confirmed', date: '3 days ago' },
      ];
    case 'feed':
      return [
        { title: 'Morning Feed', subtitle: 'All groups', value: '45 kg', date: 'Today' },
        { title: 'Feed Stock Update', subtitle: 'Warehouse A', value: '250 kg', date: 'Yesterday' },
        { title: 'Evening Feed', subtitle: 'All groups', value: '38 kg', date: 'Yesterday' },
      ];
    default:
      return baseData;
  }
}