import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { AnimalSetupWizard } from '@/components/dashboard/AnimalSetupWizard';
import { MobileFAB } from '@/components/dashboard/MobileFAB';
import { FarmOverview } from '@/components/dashboard/FarmOverview';
import { FarmSwitcher } from '@/components/dashboard/FarmSwitcher';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, isAuthenticated, animalTypes, selectAnimalType, selectedFarm } = useFarm();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Clear selected animal when on main dashboard
  useEffect(() => {
    selectAnimalType(null);
  }, [selectAnimalType]);

  if (!isAuthenticated) {
    return null;
  }

  const hasAnimals = animalTypes.length > 0;

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
              <h1 className="font-display font-semibold text-lg hidden sm:block">Dashboard</h1>
              <FarmSwitcher />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
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
          {!hasAnimals ? (
            <EmptyState onAddAnimal={() => setIsWizardOpen(true)} />
          ) : (
            <FarmOverview onAddAnimal={() => setIsWizardOpen(true)} />
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <MobileFAB onAddAnimal={() => setIsWizardOpen(true)} />

      {/* Setup Wizard */}
      <AnimalSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}