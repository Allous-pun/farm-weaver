import { AnimalRecord } from '@/types/animal';
import { Heart, AlertTriangle, Ban, DollarSign, Skull } from 'lucide-react';

interface RecentActivityProps {
  records: AnimalRecord[];
  animalName: string;
}

export function RecentActivity({ records, animalName }: RecentActivityProps) {
  const recentRecords = records.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h3 className="font-display font-semibold text-lg mb-4">Recent {animalName}</h3>
      
      {recentRecords.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No records yet. Add your first {animalName.toLowerCase()}!
        </div>
      ) : (
        <div className="space-y-3">
          {recentRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <StatusIcon status={record.status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{record.name}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {record.gender} • {record.weight} kg
                </div>
              </div>
              <StatusBadge status={record.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: AnimalRecord['status'] }) {
  const icons = {
    healthy: <Heart className="w-4 h-4 text-success" />,
    sick: <AlertTriangle className="w-4 h-4 text-warning" />,
    quarantine: <Ban className="w-4 h-4 text-destructive" />,
    sold: <DollarSign className="w-4 h-4 text-accent" />,
    deceased: <Skull className="w-4 h-4 text-muted-foreground" />,
  };

  return (
    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
      {icons[status]}
    </div>
  );
}

function StatusBadge({ status }: { status: AnimalRecord['status'] }) {
  const styles = {
    healthy: 'bg-success/10 text-success',
    sick: 'bg-warning/10 text-warning',
    quarantine: 'bg-destructive/10 text-destructive',
    sold: 'bg-accent/10 text-accent',
    deceased: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
