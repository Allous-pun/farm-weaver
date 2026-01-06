import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Dna } from 'lucide-react';
import { AnimalType, GeneticsRecord } from '@/types/animal';
import { useFarm } from '@/context/FarmContext';

const geneticsRecordSchema = z.object({
  animalName: z.string().trim().min(1, "Animal name is required").max(100),
  lineage: z.string().trim().min(1, "Lineage is required").max(200),
  sire: z.string().trim().max(100).optional(),
  dam: z.string().trim().max(100).optional(),
  traits: z.string().trim().max(500).optional(),
  breedingValue: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface QuickAddGeneticsFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
  editingRecord?: GeneticsRecord | null;
}

export function QuickAddGeneticsForm({ isOpen, onClose, animalType, editingRecord }: QuickAddGeneticsFormProps) {
  const { addGeneticsRecord, updateGeneticsRecord } = useFarm();
  const [formData, setFormData] = useState({
    animalName: '',
    lineage: '',
    sire: '',
    dam: '',
    traits: '',
    breedingValue: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        animalName: editingRecord.animalName,
        lineage: editingRecord.lineage,
        sire: editingRecord.sire || '',
        dam: editingRecord.dam || '',
        traits: editingRecord.traits || '',
        breedingValue: editingRecord.breedingValue || '',
        notes: editingRecord.notes || '',
      });
    } else {
      setFormData({
        animalName: '',
        lineage: '',
        sire: '',
        dam: '',
        traits: '',
        breedingValue: '',
        notes: '',
      });
    }
  }, [editingRecord, isOpen]);

  const handleSubmit = () => {
    const result = geneticsRecordSchema.safeParse(formData);
    
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
      animalName: formData.animalName,
      lineage: formData.lineage,
      sire: formData.sire || undefined,
      dam: formData.dam || undefined,
      traits: formData.traits || undefined,
      breedingValue: formData.breedingValue || undefined,
      notes: formData.notes || undefined,
    };

    if (editingRecord) {
      updateGeneticsRecord(editingRecord.id, recordData);
      toast({
        title: "Genetics record updated",
        description: `Updated genetics for ${formData.animalName}`,
      });
    } else {
      addGeneticsRecord(recordData);
      toast({
        title: "Genetics record added",
        description: `Added genetics record for ${formData.animalName}`,
      });
    }

    setErrors({});
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Dna className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <DrawerTitle>{editingRecord ? 'Edit' : 'Add'} Genetics Record</DrawerTitle>
              <p className="text-sm text-muted-foreground">{animalType.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            <Label htmlFor="animalName">Animal Name/ID *</Label>
            <Input
              id="animalName"
              placeholder="e.g., Champion #1234"
              value={formData.animalName}
              onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
              className={errors.animalName ? 'border-destructive' : ''}
            />
            {errors.animalName && <p className="text-xs text-destructive">{errors.animalName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lineage">Lineage/Breed Line *</Label>
            <Input
              id="lineage"
              placeholder="e.g., Champion Bloodline, Pure Heritage"
              value={formData.lineage}
              onChange={(e) => setFormData({ ...formData, lineage: e.target.value })}
              className={errors.lineage ? 'border-destructive' : ''}
            />
            {errors.lineage && <p className="text-xs text-destructive">{errors.lineage}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sire">Sire (Father)</Label>
              <Input
                id="sire"
                placeholder="Father's name/ID"
                value={formData.sire}
                onChange={(e) => setFormData({ ...formData, sire: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dam">Dam (Mother)</Label>
              <Input
                id="dam"
                placeholder="Mother's name/ID"
                value={formData.dam}
                onChange={(e) => setFormData({ ...formData, dam: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="traits">Notable Traits</Label>
            <Textarea
              id="traits"
              placeholder="e.g., High milk production, disease resistant, calm temperament"
              value={formData.traits}
              onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breedingValue">Breeding Value/Score</Label>
            <Input
              id="breedingValue"
              placeholder="e.g., A+, 95/100, Elite"
              value={formData.breedingValue}
              onChange={(e) => setFormData({ ...formData, breedingValue: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional genetic information..."
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
            <Button onClick={handleSubmit} className="flex-1 bg-violet-600 hover:bg-violet-700">
              {editingRecord ? 'Update' : 'Save'} Record
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}