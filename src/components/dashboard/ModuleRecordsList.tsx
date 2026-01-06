import { useState } from 'react';
import { format } from 'date-fns';
import { AnimalType, FeedRecord, HealthRecord, BreedingRecord, GeneticsRecord, InventoryRecord, ProductionRecord } from '@/types/animal';
import { useFarm } from '@/context/FarmContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, MoreVertical, Pencil, Trash2, Wheat, Stethoscope, Baby, Dna, Package, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ModuleRecordType = FeedRecord | HealthRecord | BreedingRecord | GeneticsRecord | InventoryRecord | ProductionRecord;

interface ModuleRecordsListProps {
  module: string;
  animalType: AnimalType;
  onAddNew: () => void;
  onEdit: (record: ModuleRecordType) => void;
}

const MODULE_CONFIG: Record<string, { icon: LucideIcon; color: string; title: string }> = {
  feed: { icon: Wheat, color: 'text-amber-500 bg-amber-500/20', title: 'Feed Records' },
  health: { icon: Stethoscope, color: 'text-rose-500 bg-rose-500/20', title: 'Health Records' },
  reproduction: { icon: Baby, color: 'text-pink-500 bg-pink-500/20', title: 'Breeding Records' },
  genetics: { icon: Dna, color: 'text-violet-500 bg-violet-500/20', title: 'Genetics Records' },
  inventory: { icon: Package, color: 'text-blue-500 bg-blue-500/20', title: 'Inventory Records' },
  production: { icon: BarChart3, color: 'text-emerald-500 bg-emerald-500/20', title: 'Production Records' },
};

function formatDate(date: Date | string) {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'N/A';
  }
}

export function ModuleRecordsList({ module, animalType, onAddNew, onEdit }: ModuleRecordsListProps) {
  const { 
    getModuleRecords,
    deleteFeedRecord,
    deleteHealthRecord,
    deleteBreedingRecord,
    deleteGeneticsRecord,
    deleteInventoryRecord,
    deleteProductionRecord,
  } = useFarm();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ModuleRecordType | null>(null);

  const records = getModuleRecords(module, animalType.id);
  const config = MODULE_CONFIG[module];

  const handleDelete = (record: ModuleRecordType) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;

    switch (module) {
      case 'feed':
        deleteFeedRecord(recordToDelete.id);
        break;
      case 'health':
        deleteHealthRecord(recordToDelete.id);
        break;
      case 'reproduction':
        deleteBreedingRecord(recordToDelete.id);
        break;
      case 'genetics':
        deleteGeneticsRecord(recordToDelete.id);
        break;
      case 'inventory':
        deleteInventoryRecord(recordToDelete.id);
        break;
      case 'production':
        deleteProductionRecord(recordToDelete.id);
        break;
    }

    toast({
      title: "Record deleted",
      description: "The record has been removed.",
    });
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const getRecordTitle = (record: ModuleRecordType): string => {
    switch (module) {
      case 'feed':
        return (record as FeedRecord).feedType;
      case 'health':
        return `${(record as HealthRecord).recordType} - ${(record as HealthRecord).animalName || 'Unknown'}`;
      case 'reproduction':
        return `${(record as BreedingRecord).eventType} - ${(record as BreedingRecord).femaleName}`;
      case 'genetics':
        return (record as GeneticsRecord).animalName;
      case 'inventory':
        return `${(record as InventoryRecord).transactionType} - ${(record as InventoryRecord).quantity} animals`;
      case 'production':
        return (record as ProductionRecord).productType;
      default:
        return 'Record';
    }
  };

  const getRecordSubtitle = (record: ModuleRecordType): string => {
    switch (module) {
      case 'feed':
        const feedRec = record as FeedRecord;
        return `${feedRec.quantity} ${feedRec.unit}${feedRec.groupOrAnimal ? ` • ${feedRec.groupOrAnimal}` : ''}`;
      case 'health':
        const healthRec = record as HealthRecord;
        return healthRec.diagnosis || healthRec.treatment || 'No details';
      case 'reproduction':
        const breedRec = record as BreedingRecord;
        return breedRec.maleName ? `with ${breedRec.maleName}` : (breedRec.offspringCount ? `${breedRec.offspringCount} offspring` : 'No details');
      case 'genetics':
        const genRec = record as GeneticsRecord;
        return genRec.lineage;
      case 'inventory':
        const invRec = record as InventoryRecord;
        return invRec.totalValue ? `$${invRec.totalValue.toFixed(2)}` : (invRec.buyer || invRec.seller || 'No details');
      case 'production':
        const prodRec = record as ProductionRecord;
        return `${prodRec.quantity} ${prodRec.unit}${prodRec.quality ? ` • ${prodRec.quality}` : ''}`;
      default:
        return '';
    }
  };

  const getRecordDate = (record: ModuleRecordType): string => {
    if ('date' in record) {
      return formatDate(record.date);
    }
    if ('createdAt' in record) {
      return formatDate(record.createdAt);
    }
    return 'N/A';
  };

  if (!config) return null;

  const Icon = config.icon;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{records.length} records</p>
            </div>
          </div>
          <Button onClick={onAddNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${config.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="font-medium mb-1">No records yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking by adding your first record.
              </p>
              <Button onClick={onAddNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate capitalize">{getRecordTitle(record)}</p>
                      <p className="text-sm text-muted-foreground truncate">{getRecordSubtitle(record)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {getRecordDate(record)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(record)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}