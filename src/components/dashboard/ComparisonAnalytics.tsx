import { useState, useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, isValid, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { GitCompare, Calendar, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ComparisonAnalyticsProps {
  animalTypeId: string;
}

const CHART_COLORS = {
  period1: 'hsl(var(--primary))',
  period2: 'hsl(var(--chart-2))',
};

type TimePeriod = 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth';
type CompareWith = 'previous' | 'lastMonth' | 'last3Months';

const TIME_PERIOD_OPTIONS = [
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last90', label: 'Last 90 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
];

const COMPARE_WITH_OPTIONS = [
  { value: 'previous', label: 'Previous period' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'last3Months', label: '3 months ago' },
];

function getDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case 'last7':
      return { start: subDays(now, 6), end: now };
    case 'last30':
      return { start: subDays(now, 29), end: now };
    case 'last90':
      return { start: subDays(now, 89), end: now };
    case 'thisMonth':
      return { start: startOfMonth(now), end: now };
    case 'lastMonth':
      return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
  }
}

function getComparisonDateRange(period: TimePeriod, compareWith: CompareWith): { start: Date; end: Date } {
  const now = new Date();
  const currentRange = getDateRange(period);
  const days = Math.ceil((currentRange.end.getTime() - currentRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (compareWith) {
    case 'previous':
      return { start: subDays(currentRange.start, days + 1), end: subDays(currentRange.start, 1) };
    case 'lastMonth':
      return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    case 'last3Months':
      return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(subMonths(now, 3)) };
  }
}

export function ComparisonAnalytics({ animalTypeId }: ComparisonAnalyticsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last30');
  const [compareWith, setCompareWith] = useState<CompareWith>('previous');
  const [compareAnimalTypeId, setCompareAnimalTypeId] = useState<string>('');
  
  const {
    animalTypes,
    productionRecords,
    healthRecords,
    inventoryRecords,
    feedRecords,
  } = useFarm();

  const otherAnimalTypes = animalTypes.filter(t => t.id !== animalTypeId);
  const currentAnimalType = animalTypes.find(t => t.id === animalTypeId);
  const comparisonAnimalType = animalTypes.find(t => t.id === compareAnimalTypeId);

  // Filter records for the current animal type
  const filteredProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId);
  const filteredHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId);
  const filteredInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId);
  const filteredFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId);

  // Filter records for the comparison animal type
  const comparisonProduction = productionRecords.filter(r => r.animalTypeId === compareAnimalTypeId);
  const comparisonHealth = healthRecords.filter(r => r.animalTypeId === compareAnimalTypeId);
  const comparisonInventory = inventoryRecords.filter(r => r.animalTypeId === compareAnimalTypeId);
  const comparisonFeed = feedRecords.filter(r => r.animalTypeId === compareAnimalTypeId);

  // Time period comparison data
  const timePeriodComparison = useMemo(() => {
    const currentRange = getDateRange(timePeriod);
    const previousRange = getComparisonDateRange(timePeriod, compareWith);

    const filterByDateRange = (records: any[], start: Date, end: Date) => {
      return records.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        return isValid(recordDate) && recordDate >= startOfDay(start) && recordDate <= end;
      });
    };

    // Current period stats
    const currentProdRecords = filterByDateRange(filteredProduction, currentRange.start, currentRange.end);
    const currentHealthRecords = filterByDateRange(filteredHealth, currentRange.start, currentRange.end);
    const currentInventoryRecords = filterByDateRange(filteredInventory, currentRange.start, currentRange.end);
    const currentFeedRecords = filterByDateRange(filteredFeed, currentRange.start, currentRange.end);

    // Previous period stats
    const prevProdRecords = filterByDateRange(filteredProduction, previousRange.start, previousRange.end);
    const prevHealthRecords = filterByDateRange(filteredHealth, previousRange.start, previousRange.end);
    const prevInventoryRecords = filterByDateRange(filteredInventory, previousRange.start, previousRange.end);
    const prevFeedRecords = filterByDateRange(filteredFeed, previousRange.start, previousRange.end);

    const currentProductionTotal = currentProdRecords.reduce((sum, r) => sum + r.quantity, 0);
    const prevProductionTotal = prevProdRecords.reduce((sum, r) => sum + r.quantity, 0);
    
    const currentHealthEvents = currentHealthRecords.length;
    const prevHealthEvents = prevHealthRecords.length;

    const currentInventoryChanges = currentInventoryRecords.reduce((sum, r) => {
      if (r.transactionType === 'purchase' || r.transactionType === 'birth') return sum + r.quantity;
      if (r.transactionType === 'sale' || r.transactionType === 'death') return sum - r.quantity;
      return sum;
    }, 0);
    const prevInventoryChanges = prevInventoryRecords.reduce((sum, r) => {
      if (r.transactionType === 'purchase' || r.transactionType === 'birth') return sum + r.quantity;
      if (r.transactionType === 'sale' || r.transactionType === 'death') return sum - r.quantity;
      return sum;
    }, 0);

    const currentFeedTotal = currentFeedRecords.reduce((sum, r) => sum + r.quantity, 0);
    const prevFeedTotal = prevFeedRecords.reduce((sum, r) => sum + r.quantity, 0);

    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    };

    return {
      production: {
        current: currentProductionTotal,
        previous: prevProductionTotal,
        change: calcChange(currentProductionTotal, prevProductionTotal),
      },
      health: {
        current: currentHealthEvents,
        previous: prevHealthEvents,
        change: calcChange(currentHealthEvents, prevHealthEvents),
      },
      inventory: {
        current: currentInventoryChanges,
        previous: prevInventoryChanges,
        change: calcChange(currentInventoryChanges, prevInventoryChanges),
      },
      feed: {
        current: currentFeedTotal,
        previous: prevFeedTotal,
        change: calcChange(currentFeedTotal, prevFeedTotal),
      },
      currentRange,
      previousRange,
    };
  }, [timePeriod, compareWith, filteredProduction, filteredHealth, filteredInventory, filteredFeed]);

  // Monthly comparison chart data
  const monthlyComparisonData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const filterByMonth = (records: any[]) => {
        return records.filter(r => {
          const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
          return isValid(recordDate) && recordDate >= monthStart && recordDate <= monthEnd;
        });
      };

      const currentProd = filterByMonth(filteredProduction).reduce((sum, r) => sum + r.quantity, 0);
      const compProd = filterByMonth(comparisonProduction).reduce((sum, r) => sum + r.quantity, 0);

      return {
        month: format(month, 'MMM yyyy'),
        [currentAnimalType?.name || 'Current']: currentProd,
        [comparisonAnimalType?.name || 'Comparison']: compareAnimalTypeId ? compProd : 0,
      };
    });
  }, [filteredProduction, comparisonProduction, currentAnimalType, comparisonAnimalType, compareAnimalTypeId]);

  // Radar comparison data for animal groups
  const radarComparisonData = useMemo(() => {
    const currentRange = getDateRange(timePeriod);

    const filterByDateRange = (records: any[], animalType: string) => {
      return records.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        return isValid(recordDate) && 
               recordDate >= startOfDay(currentRange.start) && 
               recordDate <= currentRange.end &&
               r.animalTypeId === animalType;
      });
    };

    const currentProd = filterByDateRange(productionRecords, animalTypeId).reduce((sum, r) => sum + r.quantity, 0);
    const currentHealth = filterByDateRange(healthRecords, animalTypeId).length;
    const currentFeed = filterByDateRange(feedRecords, animalTypeId).reduce((sum, r) => sum + r.quantity, 0);
    const currentInventory = filterByDateRange(inventoryRecords, animalTypeId).length;

    const compProd = compareAnimalTypeId ? filterByDateRange(productionRecords, compareAnimalTypeId).reduce((sum, r) => sum + r.quantity, 0) : 0;
    const compHealth = compareAnimalTypeId ? filterByDateRange(healthRecords, compareAnimalTypeId).length : 0;
    const compFeed = compareAnimalTypeId ? filterByDateRange(feedRecords, compareAnimalTypeId).reduce((sum, r) => sum + r.quantity, 0) : 0;
    const compInventory = compareAnimalTypeId ? filterByDateRange(inventoryRecords, compareAnimalTypeId).length : 0;

    // Normalize values to 0-100 scale
    const maxProd = Math.max(currentProd, compProd, 1);
    const maxHealth = Math.max(currentHealth, compHealth, 1);
    const maxFeed = Math.max(currentFeed, compFeed, 1);
    const maxInventory = Math.max(currentInventory, compInventory, 1);

    return [
      { metric: 'Production', current: (currentProd / maxProd) * 100, comparison: (compProd / maxProd) * 100 },
      { metric: 'Health Events', current: (currentHealth / maxHealth) * 100, comparison: (compHealth / maxHealth) * 100 },
      { metric: 'Feed Usage', current: (currentFeed / maxFeed) * 100, comparison: (compFeed / maxFeed) * 100 },
      { metric: 'Inventory Activity', current: (currentInventory / maxInventory) * 100, comparison: (compInventory / maxInventory) * 100 },
    ];
  }, [timePeriod, animalTypeId, compareAnimalTypeId, productionRecords, healthRecords, feedRecords, inventoryRecords]);

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{value.toFixed(1)}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">No change</span>
      </div>
    );
  };

  const StatCard = ({ title, current, previous, change, unit = '' }: { title: string; current: number; previous: number; change: number; unit?: string }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <ChangeIndicator value={change} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{current.toFixed(1)}{unit}</span>
          <span className="text-sm text-muted-foreground">vs {previous.toFixed(1)}{unit}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">Comparison Analytics</h2>
      </div>

      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Time Period Comparison</span>
          </TabsTrigger>
          <TabsTrigger value="animals" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            <span>Animal Group Comparison</span>
          </TabsTrigger>
        </TabsList>

        {/* Time Period Comparison Tab */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Compare Time Periods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PERIOD_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compare With</label>
                  <Select value={compareWith} onValueChange={(v) => setCompareWith(v as CompareWith)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPARE_WITH_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {format(timePeriodComparison.currentRange.start, 'MMM d')} - {format(timePeriodComparison.currentRange.end, 'MMM d, yyyy')}
                </Badge>
                <span>vs</span>
                <Badge variant="outline" className="gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.period2 }} />
                  {format(timePeriodComparison.previousRange.start, 'MMM d')} - {format(timePeriodComparison.previousRange.end, 'MMM d, yyyy')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Production" 
              current={timePeriodComparison.production.current} 
              previous={timePeriodComparison.production.previous} 
              change={timePeriodComparison.production.change}
            />
            <StatCard 
              title="Health Events" 
              current={timePeriodComparison.health.current} 
              previous={timePeriodComparison.health.previous} 
              change={timePeriodComparison.health.change}
            />
            <StatCard 
              title="Net Inventory" 
              current={timePeriodComparison.inventory.current} 
              previous={timePeriodComparison.inventory.previous} 
              change={timePeriodComparison.inventory.change}
            />
            <StatCard 
              title="Feed Consumption" 
              current={timePeriodComparison.feed.current} 
              previous={timePeriodComparison.feed.previous} 
              change={timePeriodComparison.feed.change}
            />
          </div>
        </TabsContent>

        {/* Animal Group Comparison Tab */}
        <TabsContent value="animals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Compare Animal Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current</label>
                  <Badge className="h-9 px-4">{currentAnimalType?.icon} {currentAnimalType?.name}</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compare With</label>
                  <Select value={compareAnimalTypeId} onValueChange={setCompareAnimalTypeId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select animal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherAnimalTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PERIOD_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {compareAnimalTypeId ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Monthly Production Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey={currentAnimalType?.name || 'Current'} fill={CHART_COLORS.period1} />
                      <Bar dataKey={comparisonAnimalType?.name || 'Comparison'} fill={CHART_COLORS.period2} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Metrics Radar Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarComparisonData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name={currentAnimalType?.name || 'Current'}
                        dataKey="current"
                        stroke={CHART_COLORS.period1}
                        fill={CHART_COLORS.period1}
                        fillOpacity={0.3}
                      />
                      <Radar
                        name={comparisonAnimalType?.name || 'Comparison'}
                        dataKey="comparison"
                        stroke={CHART_COLORS.period2}
                        fill={CHART_COLORS.period2}
                        fillOpacity={0.3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <GitCompare className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">Select an animal type to compare with</p>
                <p className="text-xs">Compare production, health, and other metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
