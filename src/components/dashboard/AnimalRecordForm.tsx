import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { AnimalRecord, AnimalType } from '@/types/animal';
import { X, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface AnimalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
  editingRecord?: AnimalRecord | null;
}

const STATUS_OPTIONS: { value: AnimalRecord['status']; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: 'bg-success/10 text-success border-success/30' },
  { value: 'sick', label: 'Sick', color: 'bg-warning/10 text-warning border-warning/30' },
  { value: 'quarantine', label: 'Quarantine', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  { value: 'sold', label: 'Sold', color: 'bg-accent/10 text-accent border-accent/30' },
  { value: 'deceased', label: 'Deceased', color: 'bg-muted text-muted-foreground border-border' },
];

export function AnimalRecordForm({ isOpen, onClose, animalType, editingRecord }: AnimalRecordFormProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<AnimalRecord['status']>('healthy');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addAnimalRecord, updateAnimalRecord } = useFarm();
  const { toast } = useToast();

  const isEditing = !!editingRecord;

  // Reset form when opening/closing or when editingRecord changes
  useEffect(() => {
    if (isOpen) {
      if (editingRecord) {
        setName(editingRecord.name);
        setGender(editingRecord.gender);
        setBirthDate(new Date(editingRecord.birthDate));
        setWeight(editingRecord.weight.toString());
        setStatus(editingRecord.status);
        setNotes(editingRecord.notes || '');
      } else {
        // Reset to defaults for new record
        setName('');
        setGender('female');
        setBirthDate(new Date());
        setWeight('');
        setStatus('healthy');
        setNotes('');
      }
    }
  }, [isOpen, editingRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter a name.',
        variant: 'destructive',
      });
      return;
    }

    if (!weight || isNaN(Number(weight))) {
      toast({
        title: 'Required',
        description: 'Please enter a valid weight.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const recordData = {
      animalTypeId: animalType.id,
      name: name.trim(),
      gender,
      birthDate,
      weight: Number(weight),
      status,
      notes: notes.trim() || undefined,
    };

    if (isEditing && editingRecord) {
      updateAnimalRecord(editingRecord.id, recordData);
      toast({
        title: 'Updated!',
        description: `${name} has been updated.`,
      });
    } else {
      addAnimalRecord(recordData);
      toast({
        title: 'Added!',
        description: `${name} has been added to ${animalType.name}.`,
      });
    }

    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-border/50 animate-scale-in">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-3xl">{animalType.icon}</span>
            <div>
              <CardTitle className="text-xl">
                {isEditing ? 'Edit' : 'Add New'} {animalType.name}
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Update the details below' : 'Fill in the details to add a new record'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Name / ID *</label>
              <Input
                placeholder={`e.g., ${animalType.name} #${Math.floor(Math.random() * 100)}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    gender === 'female'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span>♀️</span>
                  <span className="font-medium">
                    {animalType.terminology.femaleName || 'Female'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    gender === 'male'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span>♂️</span>
                  <span className="font-medium">
                    {animalType.terminology.maleName || 'Male'}
                  </span>
                </button>
              </div>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Birth Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={birthDate}
                    onSelect={(date) => date && setBirthDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight ({animalType.measurementUnit}) *</label>
              <Input
                type="number"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                      status === opt.value
                        ? opt.color + ' border-2'
                        : 'bg-secondary text-secondary-foreground border-transparent hover:border-primary/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/30 resize-none"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
