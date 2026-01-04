import { useState } from 'react';
import { z } from 'zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Wheat, Calendar, Clock } from 'lucide-react';
import { AnimalType } from '@/types/animal';

const feedingLogSchema = z.object({
  feedType: z.string().trim().min(1, "Feed type is required").max(100),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  groupOrAnimal: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

interface QuickAddFeedingFormProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
}

const FEED_UNITS = ['kg', 'lbs', 'liters', 'gallons', 'scoops', 'bales'];

const COMMON_FEEDS = [
  'Hay',
  'Grain',
  'Pellets',
  'Silage',
  'Grass',
  'Mixed Feed',
  'Supplements',
  'Other',
];

export function QuickAddFeedingForm({ isOpen, onClose, animalType }: QuickAddFeedingFormProps) {
  const [formData, setFormData] = useState({
    feedType: '',
    quantity: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    groupOrAnimal: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const result = feedingLogSchema.safeParse(formData);
    
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
      title: "Feeding logged",
      description: `${formData.quantity} ${formData.unit} of ${formData.feedType}`,
    });

    // Reset form
    setFormData({
      feedType: '',
      quantity: '',
      unit: 'kg',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      groupOrAnimal: '',
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Wheat className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DrawerTitle>Log Feeding</DrawerTitle>
              <p className="text-sm text-muted-foreground">{animalType.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Feed Type */}
          <div className="space-y-2">
            <Label>Feed Type *</Label>
            <Select
              value={formData.feedType}
              onValueChange={(value) => setFormData({ ...formData, feedType: value })}
            >
              <SelectTrigger className={errors.feedType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select feed type" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_FEEDS.map((feed) => (
                  <SelectItem key={feed} value={feed}>{feed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.feedType && <p className="text-xs text-destructive">{errors.feedType}</p>}
          </div>

          {/* Quantity and Unit */}
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
                  {FEED_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Group or Animal */}
          <div className="space-y-2">
            <Label htmlFor="groupOrAnimal">Group / Animal (Optional)</Label>
            <Input
              id="groupOrAnimal"
              placeholder="e.g., Barn A, All cattle, Bessie"
              value={formData.groupOrAnimal}
              onChange={(e) => setFormData({ ...formData, groupOrAnimal: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any observations..."
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
            <Button onClick={handleSubmit} className="flex-1 bg-amber-600 hover:bg-amber-700">
              Log Feeding
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}