import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { BarChart3, Calendar } from 'lucide-react';
import { AnimalType, ProductionRecord } from '@/types/animal';
import { useFarm } from '@/context/FarmContext';

const productionRecordSchema = z.object({
  productType: z.string().trim().min(1, "Product type is required").max(100),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  quality: z.string().trim().max(50).optional(),
  date: z.string().min(1, "Date is required"),
  groupOrAnimal: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface QuickAddProductionFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
  editingRecord?: ProductionRecord | null;
}

const PRODUCT_TYPES = [
  'Milk',
  'Eggs',
  'Wool',
  'Meat',
  'Honey',
  'Manure',
  'Other',
];

const QUALITY_GRADES = ['Grade A', 'Grade B', 'Grade C', 'Premium', 'Standard', 'Organic'];

const UNITS = ['liters', 'kg', 'lbs', 'pieces', 'gallons', 'units', 'tons'];

export function QuickAddProductionForm({ isOpen, onClose, animalType, editingRecord }: QuickAddProductionFormProps) {
  const { addProductionRecord, updateProductionRecord } = useFarm();
  const [formData, setFormData] = useState({
    productType: '',
    quantity: '',
    unit: 'kg',
    quality: '',
    date: new Date().toISOString().split('T')[0],
    groupOrAnimal: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        productType: editingRecord.productType,
        quantity: String(editingRecord.quantity),
        unit: editingRecord.unit,
        quality: editingRecord.quality || '',
        date: new Date(editingRecord.date).toISOString().split('T')[0],
        groupOrAnimal: editingRecord.groupOrAnimal || '',
        notes: editingRecord.notes || '',
      });
    } else {
      setFormData({
        productType: '',
        quantity: '',
        unit: 'kg',
        quality: '',
        date: new Date().toISOString().split('T')[0],
        groupOrAnimal: '',
        notes: '',
      });
    }
  }, [editingRecord, isOpen]);

  const handleSubmit = () => {
    const result = productionRecordSchema.safeParse(formData);
    
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
      productType: formData.productType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      quality: formData.quality || undefined,
      date: new Date(formData.date),
      groupOrAnimal: formData.groupOrAnimal || undefined,
      notes: formData.notes || undefined,
    };

    if (editingRecord) {
      updateProductionRecord(editingRecord.id, recordData);
      toast({
        title: "Production record updated",
        description: `Updated ${formData.quantity} ${formData.unit} of ${formData.productType}`,
      });
    } else {
      addProductionRecord(recordData);
      toast({
        title: "Production logged",
        description: `${formData.quantity} ${formData.unit} of ${formData.productType}`,
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <DrawerTitle>{editingRecord ? 'Edit' : 'Log'} Production</DrawerTitle>
              <p className="text-sm text-muted-foreground">{animalType.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            <Label>Product Type *</Label>
            <Select
              value={formData.productType}
              onValueChange={(value) => setFormData({ ...formData, productType: value })}
            >
              <SelectTrigger className={errors.productType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productType && <p className="text-xs text-destructive">{errors.productType}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={errors.quantity ? 'border-destructive' : ''}
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quality Grade</Label>
            <Select
              value={formData.quality}
              onValueChange={(value) => setFormData({ ...formData, quality: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality grade" />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="groupOrAnimal">Source (Group/Animal)</Label>
            <Input
              id="groupOrAnimal"
              placeholder="e.g., Herd A, Bessie, All cows"
              value={formData.groupOrAnimal}
              onChange={(e) => setFormData({ ...formData, groupOrAnimal: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional observations..."
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
              {editingRecord ? 'Update' : 'Log'} Production
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}