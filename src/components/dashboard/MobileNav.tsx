import { Link, useLocation } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { LayoutDashboard, Plus, Settings, User } from 'lucide-react';

interface MobileNavProps {
  onAddAnimal: () => void;
}

export function MobileNav({ onAddAnimal }: MobileNavProps) {
  const location = useLocation();
  const { selectedAnimalType } = useFarm();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-40">
      <div className="flex items-center justify-around h-16">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Home"
          active={location.pathname === '/dashboard'}
        />
        {selectedAnimalType && (
          <NavItem
            to="/dashboard"
            icon={<span className="text-xl">{selectedAnimalType.icon}</span>}
            label={selectedAnimalType.name}
            active={false}
          />
        )}
        <button
          onClick={onAddAnimal}
          className="flex flex-col items-center justify-center gap-1 p-2 -mt-6"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center shadow-lg">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
        </button>
        <NavItem
          to="/dashboard"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          active={false}
        />
        <NavItem
          to="/dashboard"
          icon={<User className="w-5 h-5" />}
          label="Profile"
          active={false}
        />
      </div>
    </nav>
  );
}

function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors ${
        active ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
