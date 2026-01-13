import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfMonth, eachMonthOfInterval, isValid } from 'date-fns';
import { Package, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface InventoryModuleContentProps {
  animalTypeId: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function InventoryModuleContent({ animalTypeId }: InventoryModuleContentProps) {
  const { inventoryRecords } = useFarm();

  const filteredInventory = inventoryRecords.filter(r => r.animalTypeId === animalTypeId);

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

  // Monthly transactions
  const monthlyTransactions = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthRecords = filteredInventory.filter(r => {
        const recordDate = r.date instanceof Date ? r.date : new Date(r.date);
        if (!isValid(recordDate)) return false;
        return startOfMonth(recordDate).getTime() === monthStart.getTime();
      });

      const sales = monthRecords.filter(r => r.transactionType === 'sale');
      const purchases = monthRecords.filter(r => r.transactionType === 'purchase');

      return {
        month: format(month, 'MMM'),
        sales: sales.reduce((sum, r) => sum + r.quantity, 0),
        purchases: purchases.reduce((sum, r) => sum + r.quantity, 0),
        salesValue: sales.reduce((sum, r) => sum + (r.totalValue || 0), 0),
      };
    });
  }, [filteredInventory]);

  // Stats
  const stats = useMemo(() => {
    const sales = filteredInventory.filter(r => r.transactionType === 'sale');
    const purchases = filteredInventory.filter(r => r.transactionType === 'purchase');
    const deaths = filteredInventory.filter(r => r.transactionType === 'death');
    const births = filteredInventory.filter(r => r.transactionType === 'birth');

    const totalSalesValue = sales.reduce((sum, r) => sum + (r.totalValue || 0), 0);
    const totalPurchasesValue = purchases.reduce((sum, r) => sum + (r.totalValue || 0), 0);

    const netChange = 
      purchases.reduce((sum, r) => sum + r.quantity, 0) +
      births.reduce((sum, r) => sum + r.quantity, 0) -
      sales.reduce((sum, r) => sum + r.quantity, 0) -
      deaths.reduce((sum, r) => sum + r.quantity, 0);

    return {
      total: filteredInventory.length,
      salesCount: sales.length,
      purchasesCount: purchases.length,
      deathsCount: deaths.length,
      birthsCount: births.length,
      totalSalesValue,
      totalPurchasesValue,
      netChange,
    };
  }, [filteredInventory]);

  const hasInventoryData = filteredInventory.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add inventory records to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Package className="w-3.5 h-3.5" />
            Transactions
          </div>
          <div className="text-xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-3 bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-600 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            Sales Value
          </div>
          <div className="text-xl font-bold text-emerald-600">${stats.totalSalesValue.toLocaleString()}</div>
        </Card>
        <Card className="p-3 bg-blue-500/5">
          <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
            Purchases Value
          </div>
          <div className="text-xl font-bold text-blue-600">${stats.totalPurchasesValue.toLocaleString()}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            Net Change
          </div>
          <div className={`text-xl font-bold flex items-center gap-1 ${stats.netChange > 0 ? 'text-emerald-600' : stats.netChange < 0 ? 'text-red-600' : ''}`}>
            {stats.netChange > 0 ? <TrendingUp className="w-4 h-4" /> : stats.netChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
            {stats.netChange > 0 ? '+' : ''}{stats.netChange}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transactions by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {hasInventoryData && inventoryByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={inventoryByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
            )}
          </CardContent>
        </Card>

        {/* Monthly Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Activity (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasInventoryData ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyTransactions}>
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
                  <Bar dataKey="purchases" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Purchases" />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataPlaceholder message="No transaction trends data" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
