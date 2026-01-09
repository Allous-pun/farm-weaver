import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '@/context/FarmContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { AnimalSetupWizard } from '@/components/dashboard/AnimalSetupWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { Menu, Settings, Bell, Moon, Sun, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GeneralSettings() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showAnimalWizard, setShowAnimalWizard] = useState(false);
  const { user } = useFarm();
  const { settings, updateSettings } = useNotifications();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('farmflow_language') || 'en';
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSaveNotificationSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your notification settings have been updated.',
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        onAddAnimal={() => setShowAnimalWizard(true)}
        activeModule={null}
        onModuleSelect={() => {}}
      />

      <MobileSidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        onAddAnimal={() => setShowAnimalWizard(true)}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileSidebar(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">General Settings</h1>
              </div>
            </div>
            <NotificationsPanel />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how FarmFlow looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    localStorage.setItem('farmflow_language', e.target.value);
                  }}
                  className="w-full max-w-xs px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure what alerts and reminders you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vaccination Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vaccination Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified before vaccinations are due
                  </p>
                </div>
                <Switch
                  checked={settings.vaccinationReminders}
                  onCheckedChange={(checked) => updateSettings({ vaccinationReminders: checked })}
                />
              </div>
              {settings.vaccinationReminders && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="vacDays">Days before due date</Label>
                  <Input
                    id="vacDays"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.vaccinationDaysBefore}
                    onChange={(e) => updateSettings({ vaccinationDaysBefore: parseInt(e.target.value) || 7 })}
                    className="w-24"
                  />
                </div>
              )}

              <Separator />

              {/* Birth Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Expected Birth Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified before expected birth dates
                  </p>
                </div>
                <Switch
                  checked={settings.birthReminders}
                  onCheckedChange={(checked) => updateSettings({ birthReminders: checked })}
                />
              </div>
              {settings.birthReminders && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="birthDays">Days before expected date</Label>
                  <Input
                    id="birthDays"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.birthDaysBefore}
                    onChange={(e) => updateSettings({ birthDaysBefore: parseInt(e.target.value) || 14 })}
                    className="w-24"
                  />
                </div>
              )}

              <Separator />

              {/* Low Inventory Alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Inventory Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when animal stock is low
                  </p>
                </div>
                <Switch
                  checked={settings.lowInventoryAlerts}
                  onCheckedChange={(checked) => updateSettings({ lowInventoryAlerts: checked })}
                />
              </div>
              {settings.lowInventoryAlerts && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="invThreshold">Low stock threshold</Label>
                  <Input
                    id="invThreshold"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.lowInventoryThreshold}
                    onChange={(e) => updateSettings({ lowInventoryThreshold: parseInt(e.target.value) || 10 })}
                    className="w-24"
                  />
                </div>
              )}

              <Separator />

              {/* Health Check Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Health Check Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded for routine health checks
                  </p>
                </div>
                <Switch
                  checked={settings.healthCheckReminders}
                  onCheckedChange={(checked) => updateSettings({ healthCheckReminders: checked })}
                />
              </div>
              {settings.healthCheckReminders && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="healthDays">Check interval (days)</Label>
                  <Input
                    id="healthDays"
                    type="number"
                    min="7"
                    max="90"
                    value={settings.healthCheckIntervalDays}
                    onChange={(e) => updateSettings({ healthCheckIntervalDays: parseInt(e.target.value) || 30 })}
                    className="w-24"
                  />
                </div>
              )}

              <div className="pt-4">
                <Button onClick={handleSaveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AnimalSetupWizard
        isOpen={showAnimalWizard}
        onClose={() => setShowAnimalWizard(false)}
      />
    </div>
  );
}
