import { useState } from 'react';
import { AnimalRecord, AnimalType } from '@/types/animal';
import { useFarm } from '@/context/FarmContext';
import { Heart, AlertTriangle, Ban, DollarSign, Skull, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface AnimalRecordsListProps {
  records: AnimalRecord[];
  animalType: AnimalType;
  onAddNew: () => void;
  onEdit: (record: AnimalRecord) => void;
}

export function AnimalRecordsList({ records, animalType, onAddNew, onEdit }: AnimalRecordsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AnimalRecord | null>(null);
  const { deleteAnimalRecord } = useFarm();
  const { toast } = useToast();

  const handleDeleteClick = (record: AnimalRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteAnimalRecord(recordToDelete.id);
      toast({
        title: 'Deleted',
        description: `${recordToDelete.name} has been removed.`,
      });
    }
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <div>
          <h3 className="font-display font-semibold text-lg">{animalType.name} Records</h3>
          <p className="text-sm text-muted-foreground">{records.length} total</p>
        </div>
        <Button onClick={onAddNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add {animalType.name}
        </Button>
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{animalType.icon}</span>
          </div>
          <h4 className="font-medium mb-2">No {animalType.name.toLowerCase()} yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first {animalType.name.toLowerCase()} to start tracking.
          </p>
          <Button onClick={onAddNew} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add First {animalType.name}
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {records.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              animalType={animalType}
              onEdit={() => onEdit(record)}
              onDelete={() => handleDeleteClick(record)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {recordToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this record from your farm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface RecordRowProps {
  record: AnimalRecord;
  animalType: AnimalType;
  onEdit: () => void;
  onDelete: () => void;
}

function RecordRow({ record, animalType, onEdit, onDelete }: RecordRowProps) {
  const statusIcons = {
    healthy: <Heart className="w-4 h-4 text-success" />,
    sick: <AlertTriangle className="w-4 h-4 text-warning" />,
    quarantine: <Ban className="w-4 h-4 text-destructive" />,
    sold: <DollarSign className="w-4 h-4 text-accent" />,
    deceased: <Skull className="w-4 h-4 text-muted-foreground" />,
  };

  const statusStyles = {
    healthy: 'bg-success/10 text-success',
    sick: 'bg-warning/10 text-warning',
    quarantine: 'bg-destructive/10 text-destructive',
    sold: 'bg-accent/10 text-accent',
    deceased: 'bg-muted text-muted-foreground',
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group">
      {/* Status Icon */}
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        {statusIcons[record.status]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{record.name}</div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          <span className="capitalize">{record.gender === 'female' ? animalType.terminology.femaleName || 'Female' : animalType.terminology.maleName || 'Male'}</span>
          <span>{record.weight} {animalType.measurementUnit}</span>
          <span className="hidden sm:inline">Born: {formatDate(record.birthDate)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[record.status]}`}>
        {record.status}
      </span>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive focus:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
