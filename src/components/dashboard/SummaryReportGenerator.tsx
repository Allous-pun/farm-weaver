import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFarm } from '@/context/FarmContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Heart,
  Package,
  Wheat,
  Baby,
  Dna,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface SummaryReportGeneratorProps {
  animalTypeId: string;
}

type ReportPeriod = 'week' | 'month';

interface ReportSection {
  title: string;
  icon: React.ReactNode;
  metrics: { label: string; value: string | number; change?: number; trend?: 'up' | 'down' | 'neutral' }[];
}

export function SummaryReportGenerator({ animalTypeId }: SummaryReportGeneratorProps) {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const {
    animalTypes,
    animalRecords,
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

    // Filter records for this animal type
    const currentAnimals = animalRecords.filter(r => r.animalTypeId === animalTypeId);
    const currentFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
    const previousFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
    const currentHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
    const previousHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
    const currentBreeding = breedingRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
    const previousBreeding = breedingRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
    const currentGenetics = geneticsRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.createdAt));
    const previousGenetics = geneticsRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.createdAt));
    const currentInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
    const previousInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));
    const currentProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId && isInCurrentPeriod(r.date));
    const previousProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId && isInPreviousPeriod(r.date));

    // Calculate metrics
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Overview metrics
    const healthyCount = currentAnimals.filter(a => a.status === 'healthy').length;
    const sickCount = currentAnimals.filter(a => a.status === 'sick').length;
    const healthRate = currentAnimals.length > 0 ? Math.round((healthyCount / currentAnimals.length) * 100) : 0;

    // Feed metrics
    const totalFeedCurrent = currentFeed.reduce((sum, r) => sum + r.quantity, 0);
    const totalFeedPrevious = previousFeed.reduce((sum, r) => sum + r.quantity, 0);
    const feedChange = calculateChange(totalFeedCurrent, totalFeedPrevious);

    // Health metrics
    const vaccinationsCurrent = currentHealth.filter(h => h.recordType === 'vaccination').length;
    const vaccinationsPrevious = previousHealth.filter(h => h.recordType === 'vaccination').length;
    const treatmentsCurrent = currentHealth.filter(h => h.recordType === 'treatment').length;
    const treatmentsPrevious = previousHealth.filter(h => h.recordType === 'treatment').length;

    // Breeding metrics
    const birthsCurrent = currentBreeding.filter(b => b.eventType === 'birth').length;
    const birthsPrevious = previousBreeding.filter(b => b.eventType === 'birth').length;
    const totalOffspringCurrent = currentBreeding
      .filter(b => b.eventType === 'birth')
      .reduce((sum, b) => sum + (b.offspringCount || 0), 0);

    // Inventory metrics
    const salesCurrent = currentInventory.filter(i => i.transactionType === 'sale');
    const salesPrevious = previousInventory.filter(i => i.transactionType === 'sale');
    const salesValueCurrent = salesCurrent.reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const salesValuePrevious = salesPrevious.reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const purchasesCurrent = currentInventory.filter(i => i.transactionType === 'purchase').length;

    // Production metrics
    const totalProductionCurrent = currentProduction.reduce((sum, p) => sum + p.quantity, 0);
    const totalProductionPrevious = previousProduction.reduce((sum, p) => sum + p.quantity, 0);
    const productionChange = calculateChange(totalProductionCurrent, totalProductionPrevious);

    return {
      period: {
        start: currentStart,
        end: currentEnd,
        label: period === 'week' 
          ? `Week of ${format(currentStart, 'MMM d')} - ${format(currentEnd, 'MMM d, yyyy')}`
          : format(currentStart, 'MMMM yyyy')
      },
      overview: {
        totalAnimals: currentAnimals.length,
        healthyCount,
        sickCount,
        healthRate,
        quarantineCount: currentAnimals.filter(a => a.status === 'quarantine').length,
      },
      feed: {
        totalQuantity: totalFeedCurrent,
        feedingEvents: currentFeed.length,
        change: feedChange,
        previousQuantity: totalFeedPrevious,
      },
      health: {
        totalEvents: currentHealth.length,
        vaccinations: vaccinationsCurrent,
        treatments: treatmentsCurrent,
        checkups: currentHealth.filter(h => h.recordType === 'checkup').length,
        illnesses: currentHealth.filter(h => h.recordType === 'illness').length,
        vaccinationChange: calculateChange(vaccinationsCurrent, vaccinationsPrevious),
        treatmentChange: calculateChange(treatmentsCurrent, treatmentsPrevious),
      },
      breeding: {
        totalEvents: currentBreeding.length,
        births: birthsCurrent,
        matings: currentBreeding.filter(b => b.eventType === 'mating').length,
        pregnancies: currentBreeding.filter(b => b.eventType === 'pregnancy').length,
        weanings: currentBreeding.filter(b => b.eventType === 'weaning').length,
        totalOffspring: totalOffspringCurrent,
        birthChange: calculateChange(birthsCurrent, birthsPrevious),
      },
      genetics: {
        recordsAdded: currentGenetics.length,
        previousRecords: previousGenetics.length,
        change: calculateChange(currentGenetics.length, previousGenetics.length),
      },
      inventory: {
        totalTransactions: currentInventory.length,
        sales: salesCurrent.length,
        purchases: purchasesCurrent,
        deaths: currentInventory.filter(i => i.transactionType === 'death').length,
        salesValue: salesValueCurrent,
        salesChange: calculateChange(salesValueCurrent, salesValuePrevious),
      },
      production: {
        totalQuantity: totalProductionCurrent,
        events: currentProduction.length,
        change: productionChange,
        previousQuantity: totalProductionPrevious,
      },
    };
  }, [animalTypeId, period, animalRecords, feedRecords, healthRecords, breedingRecords, geneticsRecords, inventoryRecords, productionRecords, animalTypes]);

  const generateReportText = () => {
    const lines = [
      `FARM PERFORMANCE REPORT`,
      `========================`,
      `Farm: ${selectedFarm?.name || 'N/A'}`,
      `Animal Type: ${animalType?.name || 'N/A'}`,
      `Period: ${reportData.period.label}`,
      `Generated: ${format(new Date(), 'PPpp')}`,
      ``,
      `HERD OVERVIEW`,
      `--------------`,
      `Total Animals: ${reportData.overview.totalAnimals}`,
      `Healthy: ${reportData.overview.healthyCount} (${reportData.overview.healthRate}%)`,
      `Sick: ${reportData.overview.sickCount}`,
      `Quarantine: ${reportData.overview.quarantineCount}`,
      ``,
      `FEED MANAGEMENT`,
      `----------------`,
      `Total Feed: ${reportData.feed.totalQuantity.toFixed(1)} units`,
      `Feeding Events: ${reportData.feed.feedingEvents}`,
      `Change from Previous Period: ${reportData.feed.change > 0 ? '+' : ''}${reportData.feed.change}%`,
      ``,
      `HEALTH & VACCINATIONS`,
      `----------------------`,
      `Total Health Events: ${reportData.health.totalEvents}`,
      `Vaccinations: ${reportData.health.vaccinations}`,
      `Treatments: ${reportData.health.treatments}`,
      `Checkups: ${reportData.health.checkups}`,
      `Illnesses: ${reportData.health.illnesses}`,
      ``,
      `REPRODUCTION`,
      `-------------`,
      `Total Events: ${reportData.breeding.totalEvents}`,
      `Births: ${reportData.breeding.births}`,
      `Total Offspring: ${reportData.breeding.totalOffspring}`,
      `Matings: ${reportData.breeding.matings}`,
      `Pregnancies: ${reportData.breeding.pregnancies}`,
      ``,
      `INVENTORY & SALES`,
      `------------------`,
      `Total Transactions: ${reportData.inventory.totalTransactions}`,
      `Sales: ${reportData.inventory.sales}`,
      `Total Sales Value: $${reportData.inventory.salesValue.toLocaleString()}`,
      `Purchases: ${reportData.inventory.purchases}`,
      `Deaths: ${reportData.inventory.deaths}`,
      ``,
      `PRODUCTION`,
      `-----------`,
      `Total Production: ${reportData.production.totalQuantity.toFixed(1)} units`,
      `Production Events: ${reportData.production.events}`,
      `Change from Previous Period: ${reportData.production.change > 0 ? '+' : ''}${reportData.production.change}%`,
      ``,
      `--- End of Report ---`,
    ];

    return lines.join('\n');
  };

  const handleDownload = () => {
    const reportText = generateReportText();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-report-${animalType?.name.toLowerCase() || 'animal'}-${period}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (change: number, inverse = false) => {
    if (inverse) {
      if (change > 0) return 'text-red-500';
      if (change < 0) return 'text-emerald-500';
    }
    if (change > 0) return 'text-emerald-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  if (!animalType) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Performance Report</CardTitle>
              <CardDescription>Comprehensive summary of {animalType.name.toLowerCase()} farm metrics</CardDescription>
            </div>
          </div>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="week" className="gap-2">
                <Calendar className="w-4 h-4" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-2">
                <Calendar className="w-4 h-4" />
                Monthly
              </TabsTrigger>
            </TabsList>
            <Badge variant="secondary" className="gap-2">
              <Clock className="w-3 h-3" />
              {reportData.period.label}
            </Badge>
          </div>

          <TabsContent value={period} className="space-y-6">
            {/* Overview Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Activity className="w-4 h-4" />
                  Total Animals
                </div>
                <div className="text-2xl font-bold">{reportData.overview.totalAnimals}</div>
              </Card>
              <Card className="p-4 bg-emerald-500/10">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Healthy
                </div>
                <div className="text-2xl font-bold text-emerald-600">{reportData.overview.healthRate}%</div>
                <div className="text-xs text-muted-foreground">{reportData.overview.healthyCount} animals</div>
              </Card>
              <Card className="p-4 bg-amber-500/10">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Sick
                </div>
                <div className="text-2xl font-bold text-amber-600">{reportData.overview.sickCount}</div>
              </Card>
              <Card className="p-4 bg-red-500/10">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Quarantine
                </div>
                <div className="text-2xl font-bold text-red-600">{reportData.overview.quarantineCount}</div>
              </Card>
            </div>

            <Separator />

            {/* Detailed Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feed */}
              {animalType.features.includes('feed') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Wheat className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold">Feed Management</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Feed</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reportData.feed.totalQuantity.toFixed(1)} units</span>
                        {getTrendIcon(reportData.feed.change)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Feeding Events</span>
                      <span className="font-medium">{reportData.feed.feedingEvents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">vs Previous</span>
                      <span className={`font-medium ${getTrendColor(reportData.feed.change)}`}>
                        {reportData.feed.change > 0 ? '+' : ''}{reportData.feed.change}%
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Health */}
              {animalType.features.includes('health') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <h3 className="font-semibold">Health & Vaccinations</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Events</span>
                      <span className="font-medium">{reportData.health.totalEvents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vaccinations</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reportData.health.vaccinations}</span>
                        {getTrendIcon(reportData.health.vaccinationChange)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Treatments</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reportData.health.treatments}</span>
                        {getTrendIcon(-reportData.health.treatmentChange)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Illnesses</span>
                      <span className="font-medium">{reportData.health.illnesses}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Reproduction */}
              {animalType.features.includes('reproduction') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Baby className="w-5 h-5 text-pink-500" />
                    <h3 className="font-semibold">Reproduction</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Births</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reportData.breeding.births}</span>
                        {getTrendIcon(reportData.breeding.birthChange)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Offspring</span>
                      <span className="font-medium">{reportData.breeding.totalOffspring}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Matings</span>
                      <span className="font-medium">{reportData.breeding.matings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pregnancies</span>
                      <span className="font-medium">{reportData.breeding.pregnancies}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Genetics */}
              {animalType.features.includes('genetics') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Dna className="w-5 h-5 text-violet-500" />
                    <h3 className="font-semibold">Genetics</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Records Added</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reportData.genetics.recordsAdded}</span>
                        {getTrendIcon(reportData.genetics.change)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">vs Previous</span>
                      <span className={`font-medium ${getTrendColor(reportData.genetics.change)}`}>
                        {reportData.genetics.change > 0 ? '+' : ''}{reportData.genetics.change}%
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Inventory */}
              {animalType.features.includes('inventory') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Inventory & Sales</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transactions</span>
                      <span className="font-medium">{reportData.inventory.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sales Value</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${reportData.inventory.salesValue.toLocaleString()}</span>
                        {getTrendIcon(reportData.inventory.salesChange)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Purchases</span>
                      <span className="font-medium">{reportData.inventory.purchases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Deaths</span>
                      <span className={`font-medium ${reportData.inventory.deaths > 0 ? 'text-red-500' : ''}`}>
                        {reportData.inventory.deaths}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Production */}
              {animalType.features.includes('production') && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold">Production</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Output</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reportData.production.totalQuantity.toFixed(1)} units</span>
                        {getTrendIcon(reportData.production.change)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Events</span>
                      <span className="font-medium">{reportData.production.events}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">vs Previous</span>
                      <span className={`font-medium ${getTrendColor(reportData.production.change)}`}>
                        {reportData.production.change > 0 ? '+' : ''}{reportData.production.change}%
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
