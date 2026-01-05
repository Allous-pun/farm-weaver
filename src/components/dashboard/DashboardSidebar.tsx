import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { 
  Leaf, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Wheat,
  Stethoscope,
  Baby,
  Dna,
  Package,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardSidebarProps {
  onAddAnimal: () => void;
  activeModule: string | null;
  onModuleSelect: (module: string | null) => void;
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

export function DashboardSidebar({ onAddAnimal, activeModule, onModuleSelect }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedAnimal, setExpandedAnimal] = useState<string | null>(null);
  const { user, animalTypes, selectedAnimalType, selectedFarm, logout } = useFarm();
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
      // Toggle expansion
      setExpandedAnimal(expandedAnimal === animalId ? null : animalId);
    } else {
      setExpandedAnimal(animalId);
      navigate(`/dashboard/animal/${animalId}`);
    }
  };

  const isMainDashboard = location.pathname === '/dashboard';

  return (
    <aside
      className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-lg">FarmFlow</div>
            <div className="text-xs text-sidebar-foreground/60 truncate">{selectedFarm?.name}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <Link
          to="/dashboard"
          className={`nav-link ${isMainDashboard ? 'active' : ''}`}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Animal Types with Modules */}
        {animalTypes.length > 0 && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-4 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Your Animals
              </div>
            )}
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
                      {!collapsed && <span className="truncate">{animal.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </button>

                  {/* Module Sub-items */}
                  {!collapsed && isExpanded && (
                    <div className="ml-4 pl-4 border-l border-sidebar-border/50 space-y-0.5">
                      {modules.map((module) => {
                        const Icon = MODULE_ICONS[module] || ClipboardList;
                        const isModuleActive = isSelected && currentModule === module;
                        
                        return (
                          <Link
                            key={module}
                            to={`/dashboard/animal/${animal.id}/${module}`}
                            className={`nav-link w-full text-sm py-2 ${isModuleActive ? 'active' : ''}`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{MODULE_LABELS[module] || module}</span>
                          </Link>
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
          onClick={onAddAnimal}
          className="nav-link w-full text-primary hover:bg-primary/10"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Add Animal</span>}
        </button>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link to="/dashboard" className="nav-link">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button onClick={logout} className="nav-link w-full text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}