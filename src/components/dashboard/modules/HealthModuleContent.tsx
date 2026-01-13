import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, isValid } from 'date-fns';
import { Heart, Syringe, Stethoscope, AlertCircle, BarChart3 } from 'lucide-react';

interface HealthModuleContentProps {
  animalTypeId: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function HealthModuleContent({ animalTypeId }: HealthModuleContentProps) {
  const { healthRecords } = useFarm();

  const filteredHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId);

  // Health events by type
  const healthByType = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredHealth.forEach(r => {
      typeCount[r.recordType] = (typeCount[r.recordType] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [filteredHealth]);

  // Health trends over time
  const healthTrends = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(day => {
      const dayStart = startOfDay(day);
      const dayRecords = filteredHealth.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        return isValid(recordDate) && startOfDay(recordDate).getTime() === dayStart.getTime();
      });

      const vaccinations = dayRecords.filter(r => r.recordType === 'vaccination').length;
      const treatments = dayRecords.filter(r => r.recordType === 'treatment').length;
      const checkups = dayRecords.filter(r => r.recordType === 'checkup').length;

      return {
        date: format(day, 'MMM d'),
        vaccinations,
        treatments,
        checkups,
        total: dayRecords.length,
      };
    });
  }, [filteredHealth]);

  // Stats
  const stats = useMemo(() => {
    const vaccinations = filteredHealth.filter(r => r.recordType === 'vaccination').length;
    const treatments = filteredHealth.filter(r => r.recordType === 'treatment').length;
    const checkups = filteredHealth.filter(r => r.recordType === 'checkup').length;
    const illnesses = filteredHealth.filter(r => r.recordType === 'illness').length;

    return {
      total: filteredHealth.length,
      vaccinations,
      treatments,
      checkups,
      illnesses,
    };
  }, [filteredHealth]);

  const hasHealthData = filteredHealth.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add health records to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Heart className="w-3.5 h-3.5" />
            Total Records
          </div>
          <div className="text-xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-3 bg-blue-500/5">
          <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
            <Syringe className="w-3.5 h-3.5" />
            Vaccinations
          </div>
          <div className="text-xl font-bold text-blue-600">{stats.vaccinations}</div>
        </Card>
        <Card className="p-3 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-600 text-xs mb-1">
            Treatments
          </div>
          <div className="text-xl font-bold text-amber-600">{stats.treatments}</div>
        </Card>
        <Card className="p-3 bg-green-500/5">
          <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            Checkups
          </div>
          <div className="text-xl font-bold text-green-600">{stats.checkups}</div>
        </Card>
        <Card className="p-3 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-600 text-xs mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Illnesses
          </div>
          <div className="text-xl font-bold text-red-600">{stats.illnesses}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Health Events by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {hasHealthData && healthByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={healthByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {healthByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No health data yet" />
            )}
          </CardContent>
        </Card>

        {/* Health Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Activity (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasHealthData ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={healthTrends}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    fill="url(#healthGradient)"
                    strokeWidth={2}
                    name="Events"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No health trends data" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
