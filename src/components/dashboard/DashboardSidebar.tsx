import { Link, useLocation } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { 
  Leaf, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  onAddAnimal: () => void;
}

export function DashboardSidebar({ onAddAnimal }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, animalTypes, selectedAnimalType, selectAnimalType, logout } = useFarm();
  const location = useLocation();

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
            <div className="text-xs text-sidebar-foreground/60 truncate">{user?.farmName}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <Link
          to="/dashboard"
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Animal Types */}
        {animalTypes.length > 0 && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-4 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Your Animals
              </div>
            )}
            {animalTypes.map((animal) => (
              <button
                key={animal.id}
                onClick={() => selectAnimalType(animal.id)}
                className={`nav-link w-full ${selectedAnimalType?.id === animal.id ? 'active' : ''}`}
              >
                <span className="text-xl flex-shrink-0">{animal.icon}</span>
                {!collapsed && <span className="truncate">{animal.name}</span>}
              </button>
            ))}
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
