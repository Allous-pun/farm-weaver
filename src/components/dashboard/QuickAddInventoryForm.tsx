import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Package, Calendar } from 'lucide-react';
import { AnimalType, InventoryRecord } from '@/types/animal';
import { useFarm } from '@/context/FarmContext';

const inventoryRecordSchema = z.object({
  transactionType: z.enum(['purchase', 'sale', 'birth', 'death', 'transfer']),
  animalName: z.string().trim().max(100).optional(),
  quantity: z.string().min(1, "Quantity is required"),
  unitPrice: z.string().optional(),
  buyer: z.string().trim().max(100).optional(),
  seller: z.string().trim().max(100).optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().trim().max(1000).optional(),
});

interface QuickAddInventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
  editingRecord?: InventoryRecord | null;
}

const TRANSACTION_TYPES = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'birth', label: 'Birth' },
  { value: 'death', label: 'Death' },
  { value: 'transfer', label: 'Transfer' },
];

export function QuickAddInventoryForm({ isOpen, onClose, animalType, editingRecord }: QuickAddInventoryFormProps) {
  const { addInventoryRecord, updateInventoryRecord } = useFarm();
  const [formData, setFormData] = useState({
    transactionType: 'sale' as 'purchase' | 'sale' | 'birth' | 'death' | 'transfer',
    animalName: '',
    quantity: '1',
    unitPrice: '',
    buyer: '',
    seller: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        transactionType: editingRecord.transactionType,
        animalName: editingRecord.animalName || '',
        quantity: String(editingRecord.quantity),
        unitPrice: editingRecord.unitPrice ? String(editingRecord.unitPrice) : '',
        buyer: editingRecord.buyer || '',
        seller: editingRecord.seller || '',
        date: new Date(editingRecord.date).toISOString().split('T')[0],
        notes: editingRecord.notes || '',
      });
    } else {
      setFormData({
        transactionType: 'sale',
        animalName: '',
        quantity: '1',
        unitPrice: '',
        buyer: '',
        seller: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [editingRecord, isOpen]);

  const handleSubmit = () => {
    const result = inventoryRecordSchema.safeParse(formData);
    
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

    const quantity = parseInt(formData.quantity);
    const unitPrice = formData.unitPrice ? parseFloat(formData.unitPrice) : undefined;
    const totalValue = unitPrice ? unitPrice * quantity : undefined;

    const recordData = {
      animalTypeId: animalType.id,
      transactionType: formData.transactionType,
      animalName: formData.animalName || undefined,
      quantity,
      unitPrice,
      totalValue,
      buyer: formData.buyer || undefined,
      seller: formData.seller || undefined,
      date: new Date(formData.date),
      notes: formData.notes || undefined,
    };

    const transactionLabel = TRANSACTION_TYPES.find(t => t.value === formData.transactionType)?.label;

    if (editingRecord) {
      updateInventoryRecord(editingRecord.id, recordData);
      toast({
        title: "Inventory record updated",
        description: `Updated ${transactionLabel} record`,
      });
    } else {
      addInventoryRecord(recordData);
      toast({
        title: "Inventory record added",
        description: `${transactionLabel}: ${quantity} ${animalType.name}`,
      });
    }

    setErrors({});
    onClose();
  };

  const showBuyerField = formData.transactionType === 'sale' || formData.transactionType === 'transfer';
  const showSellerField = formData.transactionType === 'purchase';
  const showPriceField = formData.transactionType === 'sale' || formData.transactionType === 'purchase';

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DrawerTitle>{editingRecord ? 'Edit' : 'Add'} Inventory Record</DrawerTitle>
              <p className="text-sm text-muted-foreground">{animalType.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select
              value={formData.transactionType}
              onValueChange={(value) => setFormData({ ...formData, transactionType: value as typeof formData.transactionType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="animalName">Animal Name/ID (Optional)</Label>
            <Input
              id="animalName"
              placeholder="e.g., Bessie, #1234"
              value={formData.animalName}
              onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={errors.quantity ? 'border-destructive' : ''}
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>
            {showPriceField && (
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                />
              </div>
            )}
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

          {showBuyerField && (
            <div className="space-y-2">
              <Label htmlFor="buyer">Buyer/Recipient</Label>
              <Input
                id="buyer"
                placeholder="Buyer name or destination"
                value={formData.buyer}
                onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
              />
            </div>
          )}

          {showSellerField && (
            <div className="space-y-2">
              <Label htmlFor="seller">Seller/Source</Label>
              <Input
                id="seller"
                placeholder="Seller name or source"
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
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
            <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {editingRecord ? 'Update' : 'Save'} Record
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}