import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import { TrendingUp, Activity, Package, BarChart3 } from 'lucide-react';

interface AnalyticsChartsProps {
  animalTypeId: string;
  moduleFilter?: 'production' | 'health' | 'inventory' | 'feed' | 'reproduction' | 'genetics';
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function AnalyticsCharts({ animalTypeId, moduleFilter }: AnalyticsChartsProps) {
  const {
    productionRecords,
    healthRecords,
    inventoryRecords,
    feedRecords,
  } = useFarm();

  // Filter records for the current animal type
  const filteredProduction = productionRecords.filter(r => r.animalTypeId === animalTypeId);
  const filteredHealth = healthRecords.filter(r => r.animalTypeId === animalTypeId);
  const filteredInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId);
  const filteredFeed = feedRecords.filter(r => r.animalTypeId === animalTypeId);

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

  // Inventory transactions
  const inventoryTrends = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(day => {
      const dayStart = startOfDay(day);
      const dayRecords = filteredInventory.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        return isValid(recordDate) && startOfDay(recordDate).getTime() === dayStart.getTime();
      });

      const purchases = dayRecords
        .filter(r => r.transactionType === 'purchase')
        .reduce((sum, r) => sum + r.quantity, 0);
      const sales = dayRecords
        .filter(r => r.transactionType === 'sale')
        .reduce((sum, r) => sum + r.quantity, 0);
      const births = dayRecords
        .filter(r => r.transactionType === 'birth')
        .reduce((sum, r) => sum + r.quantity, 0);
      const deaths = dayRecords
        .filter(r => r.transactionType === 'death')
        .reduce((sum, r) => sum + r.quantity, 0);

      return {
        date: format(day, 'MMM d'),
        purchases,
        sales,
        births,
        deaths,
        netChange: purchases + births - sales - deaths,
      };
    });
  }, [filteredInventory]);

  // Feed consumption trends
  const feedTrends = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(day => {
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

  // Inventory by transaction type
  const inventoryByType = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredInventory.forEach(r => {
      typeCount[r.transactionType] = (typeCount[r.transactionType] || 0) + r.quantity;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }));
  }, [filteredInventory]);

  const hasProductionData = filteredProduction.length > 0;
  const hasHealthData = filteredHealth.length > 0;
  const hasInventoryData = filteredInventory.length > 0;
  const hasFeedData = filteredFeed.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add records to see analytics</p>
    </div>
  );

  // Map module to tab value
  const moduleToTab: Record<string, string> = {
    production: 'production',
    health: 'health',
    inventory: 'inventory',
    feed: 'feed',
    reproduction: 'health', // reproduction uses health-related analytics
    genetics: 'production', // genetics uses production-related analytics
  };

  const activeTab = moduleFilter ? moduleToTab[moduleFilter] || 'production' : 'production';

  // If module filter is set, show only that module's charts without tabs
  if (moduleFilter) {
    const getModuleTitle = () => {
      switch (moduleFilter) {
        case 'health': return 'Health Analytics';
        case 'feed': return 'Feed Analytics';
        case 'production': return 'Production Analytics';
        case 'inventory': return 'Inventory Analytics';
        case 'reproduction': return 'Breeding Analytics';
        case 'genetics': return 'Genetics Analytics';
        default: return 'Analytics';
      }
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {getModuleTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'health' && (
            hasHealthData ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={healthByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
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
            )
          )}
          {activeTab === 'feed' && (
            hasFeedData ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={feedTrends.slice(-14)}>
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
                  <Bar dataKey="quantity" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No feed data yet" />
            )
          )}
          {activeTab === 'production' && (
            hasProductionData ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={productionTrends.slice(-14)}>
                  <defs>
                    <linearGradient id="prodGradientSmall" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="quantity" stroke="hsl(var(--primary))" fill="url(#prodGradientSmall)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No production data yet" />
            )
          )}
          {activeTab === 'inventory' && (
            hasInventoryData ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={inventoryByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {inventoryByType.map((_, index) => (
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
              <NoDataPlaceholder message="No inventory data yet" />
            )
          )}
        </CardContent>
      </Card>
    );
  }

  // Full tabbed view when no filter
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold">Analytics & Trends</h2>
      </div>

      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="production" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Production</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
        </TabsList>

        {/* Production Tab */}
        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Production Over Time (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {hasProductionData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productionTrends}>
                    <defs>
                      <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} className="text-muted-foreground" />
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
                      name="Quantity"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <NoDataPlaceholder message="No production data available" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Health Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {hasHealthData ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={healthByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
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
                  <NoDataPlaceholder message="No health data available" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Health Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {hasHealthData ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={healthTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="vaccinations"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="treatments"
                        stroke={CHART_COLORS[1]}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="checkups"
                        stroke={CHART_COLORS[2]}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataPlaceholder message="No health data available" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Inventory Changes (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {hasInventoryData ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={inventoryTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="purchases" fill={CHART_COLORS[0]} name="Purchases" />
                      <Bar dataKey="sales" fill={CHART_COLORS[1]} name="Sales" />
                      <Bar dataKey="births" fill={CHART_COLORS[2]} name="Births" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataPlaceholder message="No inventory data available" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Inventory by Transaction Type</CardTitle>
              </CardHeader>
              <CardContent>
                {hasInventoryData ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={inventoryByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {inventoryByType.map((_, index) => (
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
                  <NoDataPlaceholder message="No inventory data available" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Feed Consumption (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {hasFeedData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feedTrends}>
                    <defs>
                      <linearGradient id="feedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="quantity" fill="url(#feedGradient)" radius={[4, 4, 0, 0]} name="Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoDataPlaceholder message="No feed data available" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
