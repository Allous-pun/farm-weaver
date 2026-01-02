import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { AnimalSetupWizard } from '@/components/dashboard/AnimalSetupWizard';
import { AnimalSelector } from '@/components/dashboard/AnimalSelector';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, animalTypes, selectedAnimalType, animalRecords, getStats } = useFarm();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Auto-select first animal if none selected
  useEffect(() => {
    if (animalTypes.length > 0 && !selectedAnimalType) {
      // We don't auto-select to show the "select animal" state
    }
  }, [animalTypes, selectedAnimalType]);

  if (!isAuthenticated) {
    return null;
  }

  const hasAnimals = animalTypes.length > 0;
  const currentRecords = selectedAnimalType
    ? animalRecords.filter(r => r.animalTypeId === selectedAnimalType.id)
    : [];
  const stats = selectedAnimalType ? getStats(selectedAnimalType.id) : null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="relative">
        <DashboardSidebar onAddAnimal={() => setIsWizardOpen(true)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Animal Selector (Desktop) */}
            <div className="hidden md:block">
              {hasAnimals && (
                <AnimalSelector onAddNew={() => setIsWizardOpen(true)} />
              )}
            </div>

            {/* Welcome / Page Title (Mobile) */}
            <div className="md:hidden">
              <h1 className="font-display font-semibold">
                {selectedAnimalType ? selectedAnimalType.name : 'Dashboard'}
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {stats && stats.alertsCount > 0 && (
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

        {/* Mobile Animal Selector */}
        {hasAnimals && (
          <div className="md:hidden px-4 py-3 border-b border-border/50">
            <AnimalSelector onAddNew={() => setIsWizardOpen(true)} />
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {!hasAnimals ? (
            <EmptyState onAddAnimal={() => setIsWizardOpen(true)} />
          ) : !selectedAnimalType ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-display font-bold mb-2">Select an Animal</h2>
              <p className="text-muted-foreground">Choose an animal from the sidebar to view its dashboard</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ backgroundColor: selectedAnimalType.color + '20' }}
                >
                  {selectedAnimalType.icon}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold">{selectedAnimalType.name} Dashboard</h1>
                  <p className="text-muted-foreground capitalize">
                    {selectedAnimalType.category} • {currentRecords.length} total
                  </p>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <StatsOverview
                  stats={stats}
                  animalName={selectedAnimalType.name}
                  measurementUnit={selectedAnimalType.measurementUnit}
                />
              )}

              {/* Modules */}
              <div>
                <h2 className="text-lg font-display font-semibold mb-4">Management Modules</h2>
                <ModuleGrid
                  enabledFeatures={selectedAnimalType.features}
                  animalName={selectedAnimalType.name}
                />
              </div>

              {/* Recent Activity */}
              <RecentActivity records={currentRecords} animalName={selectedAnimalType.name} />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onAddAnimal={() => setIsWizardOpen(true)} />

      {/* Setup Wizard */}
      <AnimalSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
