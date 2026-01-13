import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, isValid, subMonths, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { Baby, Heart, CalendarDays, BarChart3 } from 'lucide-react';

interface ReproductionModuleContentProps {
  animalTypeId: string;
}

const CHART_COLORS = [
  'hsl(var(--chart-3))',
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ReproductionModuleContent({ animalTypeId }: ReproductionModuleContentProps) {
  const { breedingRecords } = useFarm();

  const filteredBreeding = breedingRecords.filter(r => r.animalTypeId === animalTypeId);

  // Breeding events by type
  const breedingByType = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredBreeding.forEach(r => {
      typeCount[r.eventType] = (typeCount[r.eventType] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [filteredBreeding]);

  // Monthly births over last 6 months
  const monthlyBirths = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthRecords = filteredBreeding.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        if (!isValid(recordDate)) return false;
        return startOfMonth(recordDate).getTime() === monthStart.getTime() && r.eventType === 'birth';
      });

      const totalOffspring = monthRecords.reduce((sum, r) => sum + (r.offspringCount || 0), 0);

      return {
        month: format(month, 'MMM'),
        births: monthRecords.length,
        offspring: totalOffspring,
      };
    });
  }, [filteredBreeding]);

  // Stats
  const stats = useMemo(() => {
    const births = filteredBreeding.filter(r => r.eventType === 'birth');
    const matings = filteredBreeding.filter(r => r.eventType === 'mating');
    const pregnancies = filteredBreeding.filter(r => r.eventType === 'pregnancy');
    const weanings = filteredBreeding.filter(r => r.eventType === 'weaning');
    const totalOffspring = births.reduce((sum, r) => sum + (r.offspringCount || 0), 0);

    return {
      total: filteredBreeding.length,
      births: births.length,
      matings: matings.length,
      pregnancies: pregnancies.length,
      weanings: weanings.length,
      totalOffspring,
    };
  }, [filteredBreeding]);

  const hasBreedingData = filteredBreeding.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add breeding records to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            Total Events
          </div>
          <div className="text-xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-3 bg-pink-500/5">
          <div className="flex items-center gap-2 text-pink-600 text-xs mb-1">
            <Baby className="w-3.5 h-3.5" />
            Births
          </div>
          <div className="text-xl font-bold text-pink-600">{stats.births}</div>
        </Card>
        <Card className="p-3 bg-rose-500/5">
          <div className="flex items-center gap-2 text-rose-600 text-xs mb-1">
            <Heart className="w-3.5 h-3.5" />
            Matings
          </div>
          <div className="text-xl font-bold text-rose-600">{stats.matings}</div>
        </Card>
        <Card className="p-3 bg-purple-500/5">
          <div className="flex items-center gap-2 text-purple-600 text-xs mb-1">
            <CalendarDays className="w-3.5 h-3.5" />
            Pregnancies
          </div>
          <div className="text-xl font-bold text-purple-600">{stats.pregnancies}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            Weanings
          </div>
          <div className="text-xl font-bold">{stats.weanings}</div>
        </Card>
        <Card className="p-3 bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-600 text-xs mb-1">
            Total Offspring
          </div>
          <div className="text-xl font-bold text-emerald-600">{stats.totalOffspring}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Breeding Events by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Breeding Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {hasBreedingData && breedingByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={breedingByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {breedingByType.map((_, index) => (
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
              <NoDataPlaceholder message="No breeding data yet" />
            )}
          </CardContent>
        </Card>

        {/* Monthly Births */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Births (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasBreedingData ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyBirths}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="births" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Births" />
                  <Bar dataKey="offspring" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Offspring" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No birth trends data" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
