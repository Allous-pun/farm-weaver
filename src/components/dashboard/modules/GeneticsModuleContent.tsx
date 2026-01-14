import { useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Dna, Award, BarChart3 } from 'lucide-react';

interface GeneticsModuleContentProps {
  animalTypeId: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function GeneticsModuleContent({ animalTypeId }: GeneticsModuleContentProps) {
  const { geneticsRecords } = useFarm();

  const filteredGenetics = geneticsRecords.filter(r => r.animalTypeId === animalTypeId);

  // Genetics by lineage
  const geneticsByLineage = useMemo(() => {
    const lineageCount: Record<string, number> = {};
    filteredGenetics.forEach(r => {
      lineageCount[r.lineage] = (lineageCount[r.lineage] || 0) + 1;
    });

    return Object.entries(lineageCount).map(([lineage, count]) => ({
      name: lineage,
      value: count,
    }));
  }, [filteredGenetics]);

  // Stats
  const stats = useMemo(() => {
    const uniqueLineages = new Set(filteredGenetics.map(r => r.lineage)).size;
    const withParents = filteredGenetics.filter(r => r.sire || r.dam).length;

    return {
      total: filteredGenetics.length,
      uniqueLineages,
      withParents,
    };
  }, [filteredGenetics]);

  const hasGeneticsData = filteredGenetics.length > 0;

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      <p className="text-xs">Add genetics records to see analytics</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Dna className="w-3.5 h-3.5" />
            Total Records
          </div>
          <div className="text-xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-3 bg-purple-500/5">
          <div className="flex items-center gap-2 text-purple-600 text-xs mb-1">
            Unique Lineages
          </div>
          <div className="text-xl font-bold text-purple-600">{stats.uniqueLineages}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            With Parents
          </div>
          <div className="text-xl font-bold">{stats.withParents}</div>
        </Card>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* Lineage Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lineage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {hasGeneticsData && geneticsByLineage.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={geneticsByLineage}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {geneticsByLineage.map((_, index) => (
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
              <NoDataPlaceholder message="No genetics data yet" />
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
