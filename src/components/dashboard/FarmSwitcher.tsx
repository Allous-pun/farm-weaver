import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChevronDown, Plus, Check, Building2, MapPin, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FarmSwitcher() {
  const { farms, selectedFarm, selectFarm, addFarm, deleteFarm } = useFarm();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmLocation, setNewFarmLocation] = useState('');
  const { toast } = useToast();

  const handleAddFarm = () => {
    if (!newFarmName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a farm name.',
        variant: 'destructive',
      });
      return;
    }

    const newFarm = addFarm(newFarmName.trim(), newFarmLocation.trim() || undefined);
    selectFarm(newFarm.id);
    setNewFarmName('');
    setNewFarmLocation('');
    setIsAddDialogOpen(false);
    toast({
      title: 'Farm created',
      description: `${newFarmName} has been added to your farms.`,
    });
  };

  const handleDeleteFarm = (farmId: string, farmName: string) => {
    if (farms.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'You must have at least one farm.',
        variant: 'destructive',
      });
      return;
    }
    
    deleteFarm(farmId);
    toast({
      title: 'Farm deleted',
      description: `${farmName} has been removed.`,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="truncate max-w-[120px]">
                {selectedFarm?.name || 'Select Farm'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          <DropdownMenuLabel>Your Farms</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {farms.map((farm) => (
            <DropdownMenuItem
              key={farm.id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => selectFarm(farm.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="w-4 h-4 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{farm.name}</span>
                  {farm.location && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {farm.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selectedFarm?.id === farm.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
                {farms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFarm(farm.id, farm.name);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-primary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Farm
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
            <DialogDescription>
              Create a new farm to manage a separate group of animals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="farmName" className="text-sm font-medium">
                Farm Name *
              </label>
              <Input
                id="farmName"
                placeholder="e.g., North Valley Farm"
                value={newFarmName}
                onChange={(e) => setNewFarmName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="farmLocation" className="text-sm font-medium">
                Location (optional)
              </label>
              <Input
                id="farmLocation"
                placeholder="e.g., Springfield, IL"
                value={newFarmLocation}
                onChange={(e) => setNewFarmLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFarm}>
              Create Farm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}