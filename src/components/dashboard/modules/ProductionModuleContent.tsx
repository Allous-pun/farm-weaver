import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
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
import { format, subDays, startOfDay, eachDayOfInterval, isValid } from 'date-fns';
import { TrendingUp, TrendingDown, Package, BarChart3 } from 'lucide-react';

interface ProductionModuleContentProps {
  animalTypeId: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ProductionModuleContent({ animalTypeId }: ProductionModuleContentProps) {
  const { productionRecords } = useFarm();

  const filteredProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId);

  // Production trends over last 30 days
  const productionTrends = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(day => {
      const dayStart = startOfDay(day);
      const dayRecords = filteredProduction.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        return isValid(recordDate) && startOfDay(recordDate).getTime() === dayStart.getTime();
      });

      const totalQuantity = dayRecords.reduce((sum, r) => sum + r.quantity, 0);

      return {
        date: format(day, 'MMM d'),
        quantity: totalQuantity,
        count: dayRecords.length,
      };
    });
  }, [filteredProduction]);

  // Production by type
  const productionByType = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredProduction.forEach(r => {
      typeCount[r.productType] = (typeCount[r.productType] || 0) + r.quantity;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [filteredProduction]);

  // Stats
  const stats = useMemo(() => {
    const last7Days = filteredProduction.filter(r => {
      const date = new Date(r.date);
      return date >= subDays(new Date(), 7);
    });
    const previous7Days = filteredProduction.filter(r => {
      const date = new Date(r.date);
      return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
    });

    const currentTotal = last7Days.reduce((sum, r) => sum + r.quantity, 0);
    const previousTotal = previous7Days.reduce((sum, r) => sum + r.quantity, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const totalQuantity = filteredProduction.reduce((sum, r) => sum + r.quantity, 0);
    const avgDaily = totalQuantity / 30;

    return {
      totalRecords: filteredProduction.length,
      totalQuantity,
      weeklyQuantity: currentTotal,
      avgDaily: avgDaily.toFixed(1),
      change: Math.round(change),
    };
  }, [filteredProduction]);

  const hasProductionData = filteredProduction.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add production records to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Package className="w-3.5 h-3.5" />
            Total Records
          </div>
          <div className="text-xl font-bold">{stats.totalRecords}</div>
        </Card>
        <Card className="p-3 bg-primary/5">
          <div className="flex items-center gap-2 text-primary text-xs mb-1">
            Total Production
          </div>
          <div className="text-xl font-bold text-primary">{stats.totalQuantity.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">units</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            Avg Daily
          </div>
          <div className="text-xl font-bold">{stats.avgDaily}</div>
          <div className="text-xs text-muted-foreground">units/day</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            vs Last Week
          </div>
          <div className={`text-xl font-bold flex items-center gap-1 ${stats.change > 0 ? 'text-emerald-600' : stats.change < 0 ? 'text-red-600' : ''}`}>
            {stats.change > 0 ? <TrendingUp className="w-4 h-4" /> : stats.change < 0 ? <TrendingDown className="w-4 h-4" /> : null}
            {stats.change > 0 ? '+' : ''}{stats.change}%
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Production Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Production Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasProductionData ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={productionTrends}>
                  <defs>
                    <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="quantity"
                    stroke="hsl(var(--primary))"
                    fill="url(#productionGradient)"
                    strokeWidth={2}
                    name="Production"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No production data yet" />
            )}
          </CardContent>
        </Card>

        {/* Production by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Production by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {hasProductionData && productionByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={productionByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {productionByType.map((_, index) => (
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
              <NoDataPlaceholder message="No production type data" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
