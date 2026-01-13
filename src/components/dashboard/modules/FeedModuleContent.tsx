import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { format, subDays, startOfDay, eachDayOfInterval, isValid } from 'date-fns';
import { Wheat, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface FeedModuleContentProps {
  animalTypeId: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function FeedModuleContent({ animalTypeId }: FeedModuleContentProps) {
  const { feedRecords } = useFarm();

  const filteredFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId);

  // Feed consumption trends over last 14 days
  const feedTrends = useMemo(() => {
    const last14Days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return last14Days.map(day => {
      const dayStart = startOfDay(day);
      const dayRecords = filteredFeed.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        return isValid(recordDate) && startOfDay(recordDate).getTime() === dayStart.getTime();
      });

      const totalQuantity = dayRecords.reduce((sum, r) => sum + r.quantity, 0);

      return {
        date: format(day, 'MMM d'),
        quantity: totalQuantity,
      };
    });
  }, [filteredFeed]);

  // Feed by type
  const feedByType = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredFeed.forEach(r => {
      typeCount[r.feedType] = (typeCount[r.feedType] || 0) + r.quantity;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [filteredFeed]);

  // Stats
  const stats = useMemo(() => {
    const last7Days = filteredFeed.filter(r => {
      const date = new Date(r.date);
      return date >= subDays(new Date(), 7);
    });
    const previous7Days = filteredFeed.filter(r => {
      const date = new Date(r.date);
      return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
    });

    const currentTotal = last7Days.reduce((sum, r) => sum + r.quantity, 0);
    const previousTotal = previous7Days.reduce((sum, r) => sum + r.quantity, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      totalRecords: filteredFeed.length,
      weeklyQuantity: currentTotal,
      change: Math.round(change),
    };
  }, [filteredFeed]);

  const hasFeedData = filteredFeed.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add feed records to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Wheat className="w-3.5 h-3.5" />
            Total Records
          </div>
          <div className="text-xl font-bold">{stats.totalRecords}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            Weekly Consumption
          </div>
          <div className="text-xl font-bold">{stats.weeklyQuantity.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">units</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            vs Last Week
          </div>
          <div className={`text-xl font-bold flex items-center gap-1 ${stats.change > 0 ? 'text-amber-600' : stats.change < 0 ? 'text-emerald-600' : ''}`}>
            {stats.change > 0 ? <TrendingUp className="w-4 h-4" /> : stats.change < 0 ? <TrendingDown className="w-4 h-4" /> : null}
            {stats.change > 0 ? '+' : ''}{stats.change}%
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consumption Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feed Consumption (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasFeedData ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={feedTrends}>
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
                  <Bar dataKey="quantity" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No feed data yet" />
            )}
          </CardContent>
        </Card>

        {/* Feed by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feed Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {hasFeedData && feedByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={feedByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {feedByType.map((_, index) => (
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
              <NoDataPlaceholder message="No feed type data" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
