import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { AnimalSetupWizard } from '@/components/dashboard/AnimalSetupWizard';
import { MobileFAB } from '@/components/dashboard/MobileFAB';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { ModuleRecordsList } from '@/components/dashboard/ModuleRecordsList';
import { AnimalRecordsList } from '@/components/dashboard/AnimalRecordsList';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { ComparisonAnalytics } from '@/components/dashboard/ComparisonAnalytics';
import { SummaryReportGenerator } from '@/components/dashboard/SummaryReportGenerator';
import { EventCalendar } from '@/components/dashboard/EventCalendar';
import { AnimalRecordForm } from '@/components/dashboard/AnimalRecordForm';
import { QuickAddHealthForm } from '@/components/dashboard/QuickAddHealthForm';
import { QuickAddFeedingForm } from '@/components/dashboard/QuickAddFeedingForm';
import { QuickAddBreedingForm } from '@/components/dashboard/QuickAddBreedingForm';
import { QuickAddGeneticsForm } from '@/components/dashboard/QuickAddGeneticsForm';
import { QuickAddInventoryForm } from '@/components/dashboard/QuickAddInventoryForm';
import { QuickAddProductionForm } from '@/components/dashboard/QuickAddProductionForm';
import { FarmSwitcher } from '@/components/dashboard/FarmSwitcher';
import { AddModuleDialog } from '@/components/dashboard/AddModuleDialog';
import { AnimalRecord, FeedRecord, HealthRecord, BreedingRecord, GeneticsRecord, InventoryRecord, ProductionRecord } from '@/types/animal';
import { Bell, Menu, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModuleRecordType = FeedRecord | HealthRecord | BreedingRecord | GeneticsRecord | InventoryRecord | ProductionRecord;

export default function AnimalDashboard() {
  const { animalId, module } = useParams<{ animalId: string; module?: string }>();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AnimalRecord | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeQuickForm, setActiveQuickForm] = useState<string | null>(null);
  const [editingModuleRecord, setEditingModuleRecord] = useState<ModuleRecordType | null>(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const { user, isAuthenticated, animalTypes, animalRecords, getStats, selectAnimalType, selectedFarm } = useFarm();
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

  const handleQuickAction = (actionId: string) => {
    setEditingModuleRecord(null);
    setActiveQuickForm(actionId);
  };

  const handleModuleAddNew = () => {
    if (module && module !== 'records') {
      setEditingModuleRecord(null);
      setActiveQuickForm(module);
    }
  };

  const handleModuleEdit = (record: ModuleRecordType) => {
    setEditingModuleRecord(record);
    if (module) {
      setActiveQuickForm(module);
    }
  };

  const handleCloseQuickForm = () => {
    setActiveQuickForm(null);
    setEditingModuleRecord(null);
  };

  const isModuleView = module && module !== 'records' && ['feed', 'health', 'reproduction', 'genetics', 'inventory', 'production'].includes(module);

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

            {/* Page Title & Farm Switcher */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{animalType.icon}</span>
              <h1 className="font-display font-semibold hidden sm:block">{animalType.name}</h1>
              <FarmSwitcher />
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
                  <div className="text-xs text-muted-foreground">{selectedFarm?.name}</div>
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
            // Module-specific view with integrated analytics
            <div className="space-y-6 animate-fade-in">
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
              ) : isModuleView ? (
                // Module view with records + analytics side by side on desktop
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Main content - Records list */}
                  <div className="xl:col-span-2 space-y-6">
                    <ModuleRecordsList
                      module={module}
                      animalType={animalType}
                      onAddNew={handleModuleAddNew}
                      onEdit={handleModuleEdit}
                    />
                  </div>
                  
                  {/* Sidebar - Analytics, Calendar, Reports */}
                  <div className="space-y-6">
                    {/* Module-specific analytics summary */}
                    <AnalyticsCharts animalTypeId={animalType.id} />
                    
                    {/* Event Calendar */}
                    <EventCalendar />
                    
                    {/* Comparison Analytics */}
                    <ComparisonAnalytics animalTypeId={animalType.id} />
                    
                    {/* Summary Report Generator */}
                    <SummaryReportGenerator animalTypeId={animalType.id} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Module not found</p>
                </div>
              )}
            </div>
          ) : (
            // Animal overview - clean stats + module grid only
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

              {/* Modules Grid */}
              <div>
                <h2 className="text-lg font-display font-semibold mb-4">Management Modules</h2>
                <p className="text-sm text-muted-foreground mb-4">Select a module to view records and analytics</p>
                <ModuleGrid
                  enabledFeatures={animalType.features}
                  animalName={animalType.name}
                  onModuleClick={handleModuleSelect}
                  onAddModules={() => setIsAddModuleOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <MobileFAB
        onAddAnimal={() => setIsWizardOpen(true)}
        onAddRecord={handleAddRecord}
        onQuickAction={handleQuickAction}
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

      {/* Quick Add Forms */}
      <QuickAddHealthForm
        isOpen={activeQuickForm === 'health'}
        onClose={handleCloseQuickForm}
        animalType={animalType}
        editingRecord={activeQuickForm === 'health' ? editingModuleRecord as HealthRecord : null}
      />
      <QuickAddFeedingForm
        isOpen={activeQuickForm === 'feed'}
        onClose={handleCloseQuickForm}
        animalType={animalType}
        editingRecord={activeQuickForm === 'feed' ? editingModuleRecord as FeedRecord : null}
      />
      <QuickAddBreedingForm
        isOpen={activeQuickForm === 'reproduction'}
        onClose={handleCloseQuickForm}
        animalType={animalType}
        editingRecord={activeQuickForm === 'reproduction' ? editingModuleRecord as BreedingRecord : null}
      />
      <QuickAddGeneticsForm
        isOpen={activeQuickForm === 'genetics'}
        onClose={handleCloseQuickForm}
        animalType={animalType}
        editingRecord={activeQuickForm === 'genetics' ? editingModuleRecord as GeneticsRecord : null}
      />
      <QuickAddInventoryForm
        isOpen={activeQuickForm === 'inventory'}
        onClose={handleCloseQuickForm}
        animalType={animalType}
        editingRecord={activeQuickForm === 'inventory' ? editingModuleRecord as InventoryRecord : null}
      />
      <QuickAddProductionForm
        isOpen={activeQuickForm === 'production'}
        onClose={handleCloseQuickForm}
        animalType={animalType}
        editingRecord={activeQuickForm === 'production' ? editingModuleRecord as ProductionRecord : null}
      />

      {/* Add Module Dialog */}
      <AddModuleDialog
        isOpen={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        animalType={animalType}
      />
    </div>
  );
}