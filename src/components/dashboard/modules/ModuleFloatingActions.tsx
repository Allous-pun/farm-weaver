import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BarChart3, Calendar, Sparkles, FileText, X } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
      visible: showAnalytics,
      content: analyticsContent,
    },
    {
      id: 'report',
      label: 'Reports',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/25',
      visible: showReport,
      content: reportContent,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      visible: showCalendar,
      content: calendarContent,
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: Sparkles,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/25',
      visible: showAI,
      content: (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-foreground">AI Assistant</p>
          <p className="text-sm text-center max-w-xs mt-2">
            Get intelligent insights and recommendations for your {module} management.
          </p>
          <Button className="mt-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" disabled>
            Coming Soon
          </Button>
        </div>
      ),
    },
  ].filter(action => action.visible);

  const getSheetTitle = (id: string) => {
    const moduleLabel = module.charAt(0).toUpperCase() + module.slice(1);
    switch (id) {
      case 'analytics':
        return `${moduleLabel} Analytics`;
      case 'report':
        return `${moduleLabel} Reports`;
      case 'calendar':
        return `${moduleLabel} Calendar`;
      case 'ai':
        return 'AI Assistant';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Backdrop when expanded on mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col-reverse items-end gap-3">
        {/* Action buttons - visible when expanded on mobile, always on desktop */}
        <div className={cn(
          "flex flex-col-reverse gap-3 transition-all duration-300",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"
        )}>
          {actions.map((action, index) => (
            <Sheet key={action.id} open={activeSheet === action.id} onOpenChange={(open) => setActiveSheet(open ? action.id : null)}>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className={cn(
                    'rounded-full shadow-lg h-12 px-4 transition-all duration-300 hover:scale-105 hover:shadow-xl',
                    `bg-gradient-to-r ${action.gradient} hover:brightness-110 text-white`,
                    action.shadowColor,
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 75}ms` }}
                  onClick={() => setIsExpanded(false)}
                >
                  <action.icon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{action.label}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br',
                      action.gradient
                    )}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    {getSheetTitle(action.id)}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 animate-fade-in">
                  {action.content}
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>

        {/* Main FAB toggle for mobile */}
        <Button
          size="lg"
          className={cn(
            'md:hidden rounded-full w-14 h-14 shadow-xl transition-all duration-300 hover:scale-110',
            'bg-gradient-to-r from-primary to-primary/80 hover:brightness-110',
            isExpanded && 'rotate-45'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <BarChart3 className="w-6 h-6" />
          )}
        </Button>
      </div>
    </>
  );
}
