import { useFarm } from '@/context/FarmContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Heart, 
  AlertTriangle, 
  Package,
  ArrowRight,
  Plus
} from 'lucide-react';

interface FarmOverviewProps {
  onAddAnimal: () => void;
}

export function FarmOverview({ onAddAnimal }: FarmOverviewProps) {
  const { animalTypes, animalRecords, getStats } = useFarm();
  const navigate = useNavigate();

  // Calculate overall farm stats
  const totalAnimals = animalRecords.filter(r => 
    r.status !== 'sold' && r.status !== 'deceased'
  ).length;
  
  const healthyAnimals = animalRecords.filter(r => r.status === 'healthy').length;
  const sickAnimals = animalRecords.filter(r => r.status === 'sick' || r.status === 'quarantine').length;
  
  const totalAlerts = animalTypes.reduce((sum, type) => {
    const stats = getStats(type.id);
    return sum + stats.alertsCount;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Farm Overview</h1>
        <p className="text-muted-foreground">Manage all your animals in one place</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={Package}
          label="Total Animals"
          value={totalAnimals.toString()}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatsCard
          icon={Heart}
          label="Healthy"
          value={healthyAnimals.toString()}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Need Attention"
          value={sickAnimals.toString()}
          color="text-warning"
          bgColor="bg-warning/10"
        />
        <StatsCard
          icon={TrendingUp}
          label="Alerts"
          value={totalAlerts.toString()}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
      </div>

      {/* Animal Types Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold">Your Animals</h2>
          <Button variant="outline" size="sm" onClick={onAddAnimal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Animal Type
          </Button>
        </div>

        {animalTypes.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">No animals yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first animal type to manage.
            </p>
            <Button onClick={onAddAnimal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Animal
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {animalTypes.map((animal) => {
              const stats = getStats(animal.id);
              const records = animalRecords.filter(r => r.animalTypeId === animal.id);
              
              return (
                <Card 
                  key={animal.id}
                  className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={() => navigate(`/dashboard/animal/${animal.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: animal.color + '20' }}
                        >
                          {animal.icon}
                        </div>
                        <div>
                          <h3 className="font-display font-semibold">{animal.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{animal.category}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-bold">{records.length}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="p-2 rounded-lg bg-success/10">
                        <div className="text-lg font-bold text-success">{stats.healthyCount}</div>
                        <div className="text-xs text-muted-foreground">Healthy</div>
                      </div>
                      <div className="p-2 rounded-lg bg-warning/10">
                        <div className="text-lg font-bold text-warning">{stats.sickCount}</div>
                        <div className="text-xs text-muted-foreground">Sick</div>
                      </div>
                    </div>

                    {stats.alertsCount > 0 && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {stats.alertsCount} alert{stats.alertsCount > 1 ? 's' : ''} need attention
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity across all animals */}
      {animalTypes.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {animalRecords
                  .slice(0, 5)
                  .map((record, index) => {
                    const animalType = animalTypes.find(a => a.id === record.animalTypeId);
                    if (!animalType) return null;
                    
                    return (
                      <div 
                        key={record.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/animal/${animalType.id}/records`)}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: animalType.color + '20' }}
                        >
                          {animalType.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{record.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {animalType.name} • {record.status}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'healthy' ? 'bg-success/10 text-success' :
                          record.status === 'sick' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}