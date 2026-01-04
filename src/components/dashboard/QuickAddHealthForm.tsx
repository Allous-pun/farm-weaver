import { useState } from 'react';
import { z } from 'zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, Calendar, Syringe, Pill, AlertCircle } from 'lucide-react';
import { AnimalType } from '@/types/animal';

const healthRecordSchema = z.object({
  animalName: z.string().trim().min(1, "Animal name is required").max(100),
  recordType: z.enum(['checkup', 'vaccination', 'treatment', 'injury', 'illness']),
  date: z.string().min(1, "Date is required"),
  diagnosis: z.string().trim().max(200).optional(),
  treatment: z.string().trim().max(500).optional(),
  veterinarian: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface QuickAddHealthFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
}

const RECORD_TYPES = [
  { value: 'checkup', label: 'Health Checkup', icon: Stethoscope },
  { value: 'vaccination', label: 'Vaccination', icon: Syringe },
  { value: 'treatment', label: 'Treatment', icon: Pill },
  { value: 'injury', label: 'Injury', icon: AlertCircle },
  { value: 'illness', label: 'Illness', icon: AlertCircle },
];

export function QuickAddHealthForm({ isOpen, onClose, animalType }: QuickAddHealthFormProps) {
  const [formData, setFormData] = useState({
    animalName: '',
    recordType: 'checkup' as const,
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    veterinarian: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const result = healthRecordSchema.safeParse(formData);
    
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

    // TODO: Save to database when backend is connected
    toast({
      title: "Health record added",
      description: `Recorded ${formData.recordType} for ${formData.animalName}`,
    });

    // Reset form
    setFormData({
      animalName: '',
      recordType: 'checkup',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      treatment: '',
      veterinarian: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <DrawerTitle>Add Health Record</DrawerTitle>
              <p className="text-sm text-muted-foreground">{animalType.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Animal Name */}
          <div className="space-y-2">
            <Label htmlFor="animalName">Animal Name/ID *</Label>
            <Input
              id="animalName"
              placeholder="e.g., Bessie, #1234"
              value={formData.animalName}
              onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
              className={errors.animalName ? 'border-destructive' : ''}
            />
            {errors.animalName && <p className="text-xs text-destructive">{errors.animalName}</p>}
          </div>

          {/* Record Type */}
          <div className="space-y-2">
            <Label>Record Type *</Label>
            <Select
              value={formData.recordType}
              onValueChange={(value) => setFormData({ ...formData, recordType: value as typeof formData.recordType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECORD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
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

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              placeholder="What was diagnosed?"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment</Label>
            <Textarea
              id="treatment"
              placeholder="Treatment administered..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              rows={2}
            />
          </div>

          {/* Veterinarian */}
          <div className="space-y-2">
            <Label htmlFor="veterinarian">Veterinarian</Label>
            <Input
              id="veterinarian"
              placeholder="Dr. Smith"
              value={formData.veterinarian}
              onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
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
            <Button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Save Record
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}