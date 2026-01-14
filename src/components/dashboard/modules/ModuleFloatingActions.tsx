import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BarChart3, Calendar, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleFloatingActionsProps {
  module: string;
  analyticsContent?: React.ReactNode;
  calendarContent?: React.ReactNode;
  reportContent?: React.ReactNode;
  showAnalytics?: boolean;
  showCalendar?: boolean;
  showReport?: boolean;
  showAI?: boolean;
}

export function ModuleFloatingActions({
  module,
  analyticsContent,
  calendarContent,
  reportContent,
  showAnalytics = true,
  showCalendar = true,
  showReport = true,
  showAI = true,
}: ModuleFloatingActionsProps) {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const actions = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      visible: showAnalytics,
      content: analyticsContent,
    },
    {
      id: 'report',
      label: 'Reports',
      icon: FileText,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      visible: showReport,
      content: reportContent,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      color: 'bg-amber-500 hover:bg-amber-600 text-white',
      visible: showCalendar,
      content: calendarContent,
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white',
      visible: showAI,
      content: (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Sparkles className="w-12 h-12 mb-4 text-violet-500" />
          <p className="text-lg font-medium">AI Assistant</p>
          <p className="text-sm text-center max-w-xs mt-2">
            Get intelligent insights and recommendations for your {module} management.
          </p>
          <Button className="mt-6" disabled>
            Coming Soon
          </Button>
        </div>
      ),
    },
  ].filter(action => action.visible);

  const getSheetTitle = (id: string) => {
    switch (id) {
      case 'analytics':
        return `${module.charAt(0).toUpperCase() + module.slice(1)} Analytics`;
      case 'report':
        return `${module.charAt(0).toUpperCase() + module.slice(1)} Reports`;
      case 'calendar':
        return `${module.charAt(0).toUpperCase() + module.slice(1)} Calendar`;
      case 'ai':
        return 'AI Assistant';
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 flex flex-col gap-3 z-40">
      {actions.map((action) => (
        <Sheet key={action.id} open={activeSheet === action.id} onOpenChange={(open) => setActiveSheet(open ? action.id : null)}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className={cn(
                'rounded-full shadow-lg h-12 w-12 md:h-auto md:w-auto md:px-4 md:rounded-full',
                action.color
              )}
            >
              <action.icon className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">{action.label}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <action.icon className="w-5 h-5" />
                {getSheetTitle(action.id)}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {action.content}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
