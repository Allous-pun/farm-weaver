import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { AnimalSetupWizard } from '@/components/dashboard/AnimalSetupWizard';
import { FarmSwitcher } from '@/components/dashboard/FarmSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Menu, ArrowLeft, Building2, MapPin, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FarmSettings() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { 
    user, 
    isAuthenticated, 
    selectedFarm, 
    farms,
    updateFarm, 
    deleteFarm,
    selectFarm
  } = useFarm();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmDescription, setFarmDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Populate form when farm changes
  useEffect(() => {
    if (selectedFarm) {
      setFarmName(selectedFarm.name);
      setFarmLocation(selectedFarm.location || '');
      setFarmDescription('');
    }
  }, [selectedFarm]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = () => {
    if (!selectedFarm) return;
    
    if (!farmName.trim()) {
      toast({
        title: 'Error',
        description: 'Farm name is required.',
        variant: 'destructive',
      });
      return;
    }

    updateFarm(selectedFarm.id, {
      name: farmName.trim(),
      location: farmLocation.trim() || undefined,
    });

    toast({
      title: 'Farm updated',
      description: 'Your farm settings have been saved.',
    });
  };

  const handleDelete = () => {
    if (!selectedFarm) return;
    
    if (farms.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'You must have at least one farm.',
        variant: 'destructive',
      });
      return;
    }

    const farmName = selectedFarm.name;
    deleteFarm(selectedFarm.id);
    setDeleteDialogOpen(false);
    
    toast({
      title: 'Farm deleted',
      description: `${farmName} has been removed.`,
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="relative">
        <DashboardSidebar 
          onAddAnimal={() => setIsWizardOpen(true)} 
          activeModule={null}
          onModuleSelect={() => {}}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onAddAnimal={() => setIsWizardOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title & Farm Switcher */}
            <div className="flex items-center gap-3">
              <h1 className="font-display font-semibold text-lg hidden sm:block">Farm Settings</h1>
              <FarmSwitcher />
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{selectedFarm?.name}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-2xl">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {selectedFarm ? (
            <div className="space-y-6 animate-fade-in">
              {/* Farm Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Farm Details
                  </CardTitle>
                  <CardDescription>
                    Update your farm information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="farmName" className="text-sm font-medium">
                      Farm Name *
                    </label>
                    <Input
                      id="farmName"
                      placeholder="e.g., Sunny Meadows Farm"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="farmLocation" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    <Input
                      id="farmLocation"
                      placeholder="e.g., Springfield, IL"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="farmDescription" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <Textarea
                      id="farmDescription"
                      placeholder="Add notes about your farm..."
                      value={farmDescription}
                      onChange={(e) => setFarmDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} className="w-full sm:w-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Farm Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Farm Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Farm ID</dt>
                      <dd className="font-mono text-xs">{selectedFarm.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{new Date(selectedFarm.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Farms</dt>
                      <dd>{farms.length}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for this farm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete this farm</p>
                      <p className="text-sm text-muted-foreground">
                        All animals and records will be permanently deleted.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={farms.length === 1}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Farm
                    </Button>
                  </div>
                  {farms.length === 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      You cannot delete your only farm. Create another farm first.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Farm Selected</h2>
              <p className="text-muted-foreground">Please select or create a farm first.</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farm</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedFarm?.name}"? This will permanently remove 
              all animal types and records associated with this farm. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Farm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Setup Wizard */}
      <AnimalSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}