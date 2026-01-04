import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { AnimalSetupWizard } from '@/components/dashboard/AnimalSetupWizard';
import { MobileFAB } from '@/components/dashboard/MobileFAB';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { ModuleContent } from '@/components/dashboard/ModuleContent';
import { AnimalRecordsList } from '@/components/dashboard/AnimalRecordsList';
import { AnimalRecordForm } from '@/components/dashboard/AnimalRecordForm';
import { AnimalRecord } from '@/types/animal';
import { Bell, Menu, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnimalDashboard() {
  const { animalId, module } = useParams<{ animalId: string; module?: string }>();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AnimalRecord | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, isAuthenticated, animalTypes, animalRecords, getStats, selectAnimalType } = useFarm();
  const navigate = useNavigate();

  // Find the animal type from URL params
  const animalType = animalTypes.find(a => a.id === animalId);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Update context when animal changes
  useEffect(() => {
    if (animalId) {
      selectAnimalType(animalId);
    }
  }, [animalId, selectAnimalType]);

  if (!isAuthenticated) {
    return null;
  }

  if (!animalType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Animal Not Found</h2>
          <p className="text-muted-foreground mb-4">This animal type doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentRecords = animalRecords.filter(r => r.animalTypeId === animalType.id);
  const stats = getStats(animalType.id);

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsRecordFormOpen(true);
  };

  const handleEditRecord = (record: AnimalRecord) => {
    setEditingRecord(record);
    setIsRecordFormOpen(true);
  };

  const handleCloseRecordForm = () => {
    setIsRecordFormOpen(false);
    setEditingRecord(null);
  };

  const handleModuleSelect = (newModule: string | null) => {
    if (newModule) {
      navigate(`/dashboard/animal/${animalId}/${newModule}`);
    } else {
      navigate(`/dashboard/animal/${animalId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="relative">
        <DashboardSidebar 
          onAddAnimal={() => setIsWizardOpen(true)} 
          activeModule={module || null}
          onModuleSelect={handleModuleSelect}
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

            {/* Page Title */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{animalType.icon}</span>
              <h1 className="font-display font-semibold">{animalType.name}</h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleAddRecord}
                className="hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {animalType.name}
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {stats.alertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </Button>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.farmName}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {module ? (
            // Module-specific view
            <div className="space-y-4 animate-fade-in">
              {/* Back button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/dashboard/animal/${animalId}`)}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {animalType.name} Overview
              </Button>
              
              {module === 'records' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: animalType.color + '20' }}
                      >
                        {animalType.icon}
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold">Animal Records</h1>
                        <p className="text-muted-foreground">
                          {animalType.name} • {currentRecords.length} total records
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleAddRecord}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add {animalType.name}
                    </Button>
                  </div>
                  <AnimalRecordsList
                    records={currentRecords}
                    animalType={animalType}
                    onAddNew={handleAddRecord}
                    onEdit={handleEditRecord}
                  />
                </div>
              ) : (
                <ModuleContent module={module} animalType={animalType} />
              )}
            </div>
          ) : (
            // Animal overview
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ backgroundColor: animalType.color + '20' }}
                  >
                    {animalType.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">{animalType.name} Dashboard</h1>
                    <p className="text-muted-foreground capitalize">
                      {animalType.category} • {currentRecords.length} total
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddRecord}
                  className="sm:hidden"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Stats */}
              <StatsOverview
                stats={stats}
                animalName={animalType.name}
                measurementUnit={animalType.measurementUnit}
              />

              {/* Modules */}
              <div>
                <h2 className="text-lg font-display font-semibold mb-4">Management Modules</h2>
                <ModuleGrid
                  enabledFeatures={animalType.features}
                  animalName={animalType.name}
                  onModuleClick={handleModuleSelect}
                />
              </div>

              {/* Recent Animal Records */}
              <AnimalRecordsList
                records={currentRecords.slice(0, 5)}
                animalType={animalType}
                onAddNew={handleAddRecord}
                onEdit={handleEditRecord}
                showViewAll={() => navigate(`/dashboard/animal/${animalId}/records`)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <MobileFAB
        onAddAnimal={() => setIsWizardOpen(true)}
        onAddRecord={handleAddRecord}
        enabledFeatures={animalType.features}
        animalId={animalId}
      />

      {/* Setup Wizard */}
      <AnimalSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Animal Record Form */}
      <AnimalRecordForm
        isOpen={isRecordFormOpen}
        onClose={handleCloseRecordForm}
        animalType={animalType}
        editingRecord={editingRecord}
      />
    </div>
  );
}