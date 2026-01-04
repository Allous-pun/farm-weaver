import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { 
  Leaf, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut,
  ChevronDown,
  ClipboardList,
  Wheat,
  Stethoscope,
  Baby,
  Dna,
  Package,
  BarChart3,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnimal: () => void;
}

const MODULE_ICONS: Record<string, React.ElementType> = {
  records: ClipboardList,
  feed: Wheat,
  health: Stethoscope,
  reproduction: Baby,
  genetics: Dna,
  inventory: Package,
  production: BarChart3,
};

const MODULE_LABELS: Record<string, string> = {
  records: 'Animal Records',
  feed: 'Feed Management',
  health: 'Health & Vaccinations',
  reproduction: 'Reproduction',
  genetics: 'Genetics & Breeding',
  inventory: 'Inventory & Sales',
  production: 'Production',
};

export function MobileSidebar({ isOpen, onClose, onAddAnimal }: MobileSidebarProps) {
  const [expandedAnimal, setExpandedAnimal] = useState<string | null>(null);
  const { user, animalTypes, logout } = useFarm();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract current animal ID from URL
  const pathMatch = location.pathname.match(/\/dashboard\/animal\/([^/]+)/);
  const currentAnimalId = pathMatch ? pathMatch[1] : null;
  const currentModule = location.pathname.split('/').pop();
  const isOnModule = currentAnimalId && currentModule && currentModule !== currentAnimalId;

  // Auto-expand current animal
  useEffect(() => {
    if (currentAnimalId) {
      setExpandedAnimal(currentAnimalId);
    }
  }, [currentAnimalId]);

  const handleAnimalClick = (animalId: string) => {
    if (currentAnimalId === animalId) {
      setExpandedAnimal(expandedAnimal === animalId ? null : animalId);
    } else {
      setExpandedAnimal(animalId);
      navigate(`/dashboard/animal/${animalId}`);
      onClose();
    }
  };

  const handleModuleClick = (animalId: string, module: string) => {
    navigate(`/dashboard/animal/${animalId}/${module}`);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isMainDashboard = location.pathname === '/dashboard';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 bg-sidebar [&>button]:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="font-display font-bold text-lg">FarmFlow</div>
            <div className="text-xs text-sidebar-foreground/60 truncate">{user?.farmName}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sidebar-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`nav-link ${isMainDashboard ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* Animal Types with Modules */}
          {animalTypes.length > 0 && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Your Animals
              </div>
              {animalTypes.map((animal) => {
                const isExpanded = expandedAnimal === animal.id;
                const isSelected = currentAnimalId === animal.id;
                
                // Always include 'records' module plus enabled features
                const modules: string[] = ['records', ...animal.features];

                return (
                  <div key={animal.id} className="space-y-0.5">
                    {/* Animal Type Header */}
                    <button
                      onClick={() => handleAnimalClick(animal.id)}
                      className={`nav-link w-full justify-between ${isSelected && !isOnModule ? 'active' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{animal.icon}</span>
                        <span className="truncate">{animal.name}</span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {/* Module Sub-items */}
                    {isExpanded && (
                      <div className="ml-4 pl-4 border-l border-sidebar-border/50 space-y-0.5">
                        {modules.map((module) => {
                          const Icon = MODULE_ICONS[module] || ClipboardList;
                          const isModuleActive = isSelected && currentModule === module;
                          
                          return (
                            <button
                              key={module}
                              onClick={() => handleModuleClick(animal.id, module)}
                              className={`nav-link w-full text-sm py-2 ${isModuleActive ? 'active' : ''}`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{MODULE_LABELS[module] || module}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Add Animal */}
          <button
            onClick={() => {
              onAddAnimal();
              onClose();
            }}
            className="nav-link w-full text-primary hover:bg-primary/10"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span>Add Animal</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border bg-sidebar space-y-1">
          <Link to="/dashboard" onClick={onClose} className="nav-link">
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="nav-link w-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}