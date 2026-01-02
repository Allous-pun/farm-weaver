import { DashboardStats } from '@/types/animal';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Package, Heart } from 'lucide-react';

interface StatsOverviewProps {
  stats: DashboardStats;
  animalName: string;
  measurementUnit: string;
}

export function StatsOverview({ stats, animalName, measurementUnit }: StatsOverviewProps) {
  const healthPercentage = stats.totalCount > 0 
    ? Math.round((stats.healthyCount / stats.totalCount) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Package className="w-5 h-5" />}
        label={`Total ${animalName}`}
        value={stats.totalCount.toString()}
        trend={+12}
        color="primary"
      />
      <StatCard
        icon={<Heart className="w-5 h-5" />}
        label="Health Rate"
        value={`${healthPercentage}%`}
        subtext={`${stats.healthyCount} healthy`}
        trend={healthPercentage > 80 ? +5 : -3}
        color={healthPercentage > 80 ? 'success' : 'warning'}
      />
      <StatCard
        icon={<Activity className="w-5 h-5" />}
        label="Production Today"
        value={`${stats.productionToday}`}
        subtext={measurementUnit}
        trend={+8}
        color="accent"
      />
      <StatCard
        icon={<AlertTriangle className="w-5 h-5" />}
        label="Active Alerts"
        value={stats.alertsCount.toString()}
        subtext="Need attention"
        color={stats.alertsCount > 0 ? 'warning' : 'muted'}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  trend?: number;
  color: 'primary' | 'success' | 'warning' | 'accent' | 'muted';
}

function StatCard({ icon, label, value, subtext, trend, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent',
    muted: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="stat-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-display font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
    </div>
  );
}
