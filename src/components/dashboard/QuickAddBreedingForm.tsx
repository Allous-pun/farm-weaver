import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Baby, Calendar, Heart } from 'lucide-react';
import { AnimalType, BreedingRecord } from '@/types/animal';
import { useFarm } from '@/context/FarmContext';

const breedingLogSchema = z.object({
  eventType: z.enum(['mating', 'pregnancy', 'birth', 'weaning']),
  femaleName: z.string().trim().min(1, "Female name is required").max(100),
  maleName: z.string().trim().max(100).optional(),
  date: z.string().min(1, "Date is required"),
  expectedDueDate: z.string().optional(),
  offspringCount: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface QuickAddBreedingFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
  editingRecord?: BreedingRecord | null;
}

const EVENT_TYPES = [
  { value: 'mating', label: 'Mating/Breeding' },
  { value: 'pregnancy', label: 'Pregnancy Confirmed' },
  { value: 'birth', label: 'Birth/Delivery' },
  { value: 'weaning', label: 'Weaning' },
];

export function QuickAddBreedingForm({ isOpen, onClose, animalType, editingRecord }: QuickAddBreedingFormProps) {
  const { addBreedingRecord, updateBreedingRecord } = useFarm();
  const [formData, setFormData] = useState({
    eventType: 'mating' as 'mating' | 'pregnancy' | 'birth' | 'weaning',
    femaleName: '',
    maleName: '',
    date: new Date().toISOString().split('T')[0],
    expectedDueDate: '',
    offspringCount: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const terminology = animalType.terminology;

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        eventType: editingRecord.eventType,
        femaleName: editingRecord.femaleName,
        maleName: editingRecord.maleName || '',
        date: new Date(editingRecord.date).toISOString().split('T')[0],
        expectedDueDate: editingRecord.expectedDueDate ? new Date(editingRecord.expectedDueDate).toISOString().split('T')[0] : '',
        offspringCount: editingRecord.offspringCount ? String(editingRecord.offspringCount) : '',
        notes: editingRecord.notes || '',
      });
    } else {
      setFormData({
        eventType: 'mating',
        femaleName: '',
        maleName: '',
        date: new Date().toISOString().split('T')[0],
        expectedDueDate: '',
        offspringCount: '',
        notes: '',
      });
    }
  }, [editingRecord, isOpen]);

  const handleSubmit = () => {
    const result = breedingLogSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const recordData = {
      animalTypeId: animalType.id,
      eventType: formData.eventType,
      femaleName: formData.femaleName,
      maleName: formData.maleName || undefined,
      date: new Date(formData.date),
      expectedDueDate: formData.expectedDueDate ? new Date(formData.expectedDueDate) : undefined,
      offspringCount: formData.offspringCount ? parseInt(formData.offspringCount) : undefined,
      notes: formData.notes || undefined,
    };

    const eventLabel = EVENT_TYPES.find(e => e.value === formData.eventType)?.label;

    if (editingRecord) {
      updateBreedingRecord(editingRecord.id, recordData);
      toast({
        title: "Breeding record updated",
        description: `Updated ${eventLabel} for ${formData.femaleName}`,
      });
    } else {
      addBreedingRecord(recordData);
      toast({
        title: "Breeding event logged",
        description: `${eventLabel} recorded for ${formData.femaleName}`,
      });
    }

    setErrors({});
    onClose();
  };

  const showMaleField = formData.eventType === 'mating';
  const showDueDateField = formData.eventType === 'mating' || formData.eventType === 'pregnancy';
  const showOffspringField = formData.eventType === 'birth';

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Baby className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <DrawerTitle>{editingRecord ? 'Edit' : 'Log'} Breeding Event</DrawerTitle>
              <p className="text-sm text-muted-foreground">{animalType.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            <Label>Event Type *</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData({ ...formData, eventType: value as typeof formData.eventType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="femaleName">{terminology.femaleName} Name/ID *</Label>
            <Input
              id="femaleName"
              placeholder={`e.g., ${terminology.femaleName} #1234`}
              value={formData.femaleName}
              onChange={(e) => setFormData({ ...formData, femaleName: e.target.value })}
              className={errors.femaleName ? 'border-destructive' : ''}
            />
            {errors.femaleName && <p className="text-xs text-destructive">{errors.femaleName}</p>}
          </div>

          {showMaleField && (
            <div className="space-y-2">
              <Label htmlFor="maleName">{terminology.maleName} Name/ID</Label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="maleName"
                  placeholder={`e.g., ${terminology.maleName} #5678`}
                  value={formData.maleName}
                  onChange={(e) => setFormData({ ...formData, maleName: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {showDueDateField && (
            <div className="space-y-2">
              <Label htmlFor="expectedDueDate">Expected {terminology.birthEventName} Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="expectedDueDate"
                  type="date"
                  value={formData.expectedDueDate}
                  onChange={(e) => setFormData({ ...formData, expectedDueDate: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {showOffspringField && (
            <div className="space-y-2">
              <Label htmlFor="offspringCount">Number of {terminology.youngName}s</Label>
              <Input
                id="offspringCount"
                type="number"
                min="1"
                placeholder="1"
                value={formData.offspringCount}
                onChange={(e) => setFormData({ ...formData, offspringCount: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any observations or details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DrawerFooter className="border-t border-border pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-pink-600 hover:bg-pink-700">
              {editingRecord ? 'Update' : 'Log'} Event
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}