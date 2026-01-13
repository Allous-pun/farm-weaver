import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFarm } from '@/context/FarmContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock
} from 'lucide-react';
import { format, subWeeks, subMonths, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface ModuleReportCardProps {
  animalTypeId: string;
  module: 'feed' | 'health' | 'reproduction' | 'genetics' | 'inventory' | 'production';
}

type ReportPeriod = 'week' | 'month';

export function ModuleReportCard({ animalTypeId, module }: ModuleReportCardProps) {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const {
    animalTypes,
    feedRecords,
    healthRecords,
    breedingRecords,
    geneticsRecords,
    inventoryRecords,
    productionRecords,
    selectedFarm,
  } = useFarm();

  const animalType = animalTypes.find(t => t.id === animalTypeId);

  const reportData = useMemo(() => {
    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    if (period === 'week') {
      currentStart = startOfWeek(now, { weekStartsOn: 1 });
      currentEnd = endOfWeek(now, { weekStartsOn: 1 });
      previousStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      previousEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    } else {
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
    }

    const isInCurrentPeriod = (date: Date) => {
      const d = new Date(date);
      return isWithinInterval(d, { start: currentStart, end: currentEnd });
    };

    const isInPreviousPeriod = (date: Date) => {
      const d = new Date(date);
      return isWithinInterval(d, { start: previousStart, end: previousEnd });
    };

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Module-specific data
    switch (module) {
      case 'feed': {
        const currentFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
        const previousFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
        const currentTotal = currentFeed.reduce((sum, r) => sum + r.quantity, 0);
        const previousTotal = previousFeed.reduce((sum, r) => sum + r.quantity, 0);
        return {
          title: 'Feed Management',
          metrics: [
            { label: 'Total Feed', value: `${currentTotal.toFixed(1)} units`, change: calculateChange(currentTotal, previousTotal) },
            { label: 'Feeding Events', value: currentFeed.length },
          ],
        };
      }
      case 'health': {
        const currentHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
        const previousHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
        return {
          title: 'Health & Vaccination',
          metrics: [
            { label: 'Total Events', value: currentHealth.length, change: calculateChange(currentHealth.length, previousHealth.length) },
            { label: 'Vaccinations', value: currentHealth.filter(h => h.recordType === 'vaccination').length },
            { label: 'Treatments', value: currentHealth.filter(h => h.recordType === 'treatment').length },
            { label: 'Checkups', value: currentHealth.filter(h => h.recordType === 'checkup').length },
          ],
        };
      }
      case 'reproduction': {
        const currentBreeding = breedingRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
        const previousBreeding = breedingRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
        const births = currentBreeding.filter(b => b.eventType === 'birth');
        const totalOffspring = births.reduce((sum, b) => sum + (b.offspringCount || 0), 0);
        return {
          title: 'Reproduction',
          metrics: [
            { label: 'Total Events', value: currentBreeding.length, change: calculateChange(currentBreeding.length, previousBreeding.length) },
            { label: 'Births', value: births.length },
            { label: 'Total Offspring', value: totalOffspring },
            { label: 'Matings', value: currentBreeding.filter(b => b.eventType === 'mating').length },
          ],
        };
      }
      case 'genetics': {
        const currentGenetics = geneticsRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.createdAt));
        const previousGenetics = geneticsRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.createdAt));
        return {
          title: 'Genetics',
          metrics: [
            { label: 'Records Added', value: currentGenetics.length, change: calculateChange(currentGenetics.length, previousGenetics.length) },
            { label: 'With Parents', value: currentGenetics.filter(g => g.sire || g.dam).length },
          ],
        };
      }
      case 'inventory': {
        const currentInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
        const previousInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
        const sales = currentInventory.filter(i => i.transactionType === 'sale');
        const salesValue = sales.reduce((sum, s) => sum + (s.totalValue || 0), 0);
        return {
          title: 'Inventory',
          metrics: [
            { label: 'Transactions', value: currentInventory.length, change: calculateChange(currentInventory.length, previousInventory.length) },
            { label: 'Sales', value: sales.length },
            { label: 'Sales Value', value: `$${salesValue.toLocaleString()}` },
            { label: 'Purchases', value: currentInventory.filter(i => i.transactionType === 'purchase').length },
          ],
        };
      }
      case 'production': {
        const currentProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
        const previousProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
        const currentTotal = currentProduction.reduce((sum, p) => sum + p.quantity, 0);
        const previousTotal = previousProduction.reduce((sum, p) => sum + p.quantity, 0);
        return {
          title: 'Production',
          metrics: [
            { label: 'Total Production', value: `${currentTotal.toFixed(1)} units`, change: calculateChange(currentTotal, previousTotal) },
            { label: 'Events', value: currentProduction.length },
          ],
        };
      }
      default:
        return { title: 'Report', metrics: [] };
    }
  }, [animalTypeId, module, period, feedRecords, healthRecords, breedingRecords, geneticsRecords, inventoryRecords, productionRecords]);

  const periodLabel = period === 'week' 
    ? `Week of ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}`
    : format(new Date(), 'MMMM yyyy');

  const getTrendIcon = (change?: number) => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  if (!animalType) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">{reportData.title} Report</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <Clock className="w-3 h-3" />
            {periodLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3 h-8">
            <TabsTrigger value="week" className="text-xs gap-1">
              <Calendar className="w-3 h-3" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs gap-1">
              <Calendar className="w-3 h-3" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-0">
            <div className="space-y-2">
              {reportData.metrics.map((metric, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{metric.value}</span>
                    {getTrendIcon(metric.change)}
                    {metric.change !== undefined && (
                      <span className={`text-xs ${metric.change > 0 ? 'text-emerald-500' : metric.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
