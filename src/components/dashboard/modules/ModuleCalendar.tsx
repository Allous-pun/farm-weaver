import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useFarm } from '@/context/FarmContext';
import { 
  CalendarDays, 
  Syringe, 
  Baby, 
  AlertTriangle, 
  Wheat,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  format, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths,
  addDays,
  differenceInDays,
  isValid
} from 'date-fns';
import { cn } from '@/lib/utils';

interface ModuleCalendarProps {
  animalTypeId: string;
  module: 'feed' | 'health' | 'reproduction' | 'production';
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export function ModuleCalendar({ animalTypeId, module }: ModuleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { healthRecords, breedingRecords, feedRecords, productionRecords, animalTypes } = useFarm();

  const animalType = animalTypes.find(a => a.id === animalTypeId);

  const events = useMemo<CalendarEvent[]>(() => {
    const eventList: CalendarEvent[] = [];
    const today = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    switch (module) {
      case 'health': {
        // Upcoming vaccinations
        const vaccinationRecords = healthRecords
          .filter(r => r.animalTypeId === animalTypeId && r.recordType === 'vaccination')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (vaccinationRecords.length > 0) {
          const lastVaccination = new Date(vaccinationRecords[0].date);
          const nextDue = addDays(lastVaccination, 90);
          const daysUntil = differenceInDays(nextDue, today);
          
          if (nextDue >= monthStart && nextDue <= monthEnd) {
            eventList.push({
              id: `vax-${animalTypeId}`,
              title: 'Vaccination Due',
              date: nextDue,
              type: 'vaccination',
              priority: daysUntil < 0 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
              description: daysUntil < 0 ? 'Overdue' : `Due in ${daysUntil} days`
            });
          }
        }

        // Health checkup reminders
        const checkupRecords = healthRecords
          .filter(r => r.animalTypeId === animalTypeId && r.recordType === 'checkup')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (checkupRecords.length > 0) {
          const lastCheckup = new Date(checkupRecords[0].date);
          const nextDue = addDays(lastCheckup, 30);
          const daysUntil = differenceInDays(nextDue, today);
          
          if (nextDue >= monthStart && nextDue <= monthEnd) {
            eventList.push({
              id: `checkup-${animalTypeId}`,
              title: 'Health Checkup Due',
              date: nextDue,
              type: 'checkup',
              priority: daysUntil < 0 ? 'high' : 'medium',
              description: daysUntil < 0 ? 'Overdue' : `Due in ${daysUntil} days`
            });
          }
        }
        break;
      }
      case 'reproduction': {
        // Expected births
        const pregnancyRecords = breedingRecords.filter(
          r => r.animalTypeId === animalTypeId && r.eventType === 'pregnancy' && r.expectedDueDate
        );
        pregnancyRecords.forEach(record => {
          if (!record.expectedDueDate) return;
          
          const dueDate = new Date(record.expectedDueDate);
          const daysUntil = differenceInDays(dueDate, today);
          
          if (dueDate >= monthStart && dueDate <= monthEnd) {
            eventList.push({
              id: `birth-${record.id}`,
              title: `Birth: ${record.femaleName}`,
              date: dueDate,
              type: 'birth',
              priority: daysUntil < 0 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
              description: daysUntil < 0 ? 'Past due' : `Expected in ${daysUntil} days`
            });
          }
        });

        // Weaning dates
        const birthRecords = breedingRecords.filter(
          r => r.animalTypeId === animalTypeId && r.eventType === 'birth'
        );
        birthRecords.forEach(record => {
          const birthDate = new Date(record.date);
          const weaningDate = addDays(birthDate, 60); // 60 days after birth
          const daysUntil = differenceInDays(weaningDate, today);
          
          if (weaningDate >= monthStart && weaningDate <= monthEnd && daysUntil > 0) {
            eventList.push({
              id: `weaning-${record.id}`,
              title: 'Weaning Due',
              date: weaningDate,
              type: 'weaning',
              priority: daysUntil <= 3 ? 'medium' : 'low',
              description: `In ${daysUntil} days`
            });
          }
        });
        break;
      }
      case 'feed': {
        // Feed schedule reminders (daily)
        const lastFeed = feedRecords
          .filter(r => r.animalTypeId === animalTypeId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (lastFeed) {
          const lastFeedDate = new Date(lastFeed.date);
          const nextFeedDue = addDays(lastFeedDate, 1);
          
          if (isSameDay(nextFeedDue, today) || nextFeedDue < today) {
            eventList.push({
              id: `feed-${animalTypeId}`,
              title: 'Feeding Schedule',
              date: today,
              type: 'feed',
              priority: 'medium',
              description: 'Daily feeding reminder'
            });
          }
        }
        break;
      }
      case 'production': {
        // Production recording reminder
        const lastProduction = productionRecords
          .filter(r => r.animalTypeId === animalTypeId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (lastProduction) {
          const lastDate = new Date(lastProduction.date);
          if (!isSameDay(lastDate, today)) {
            eventList.push({
              id: `prod-${animalTypeId}`,
              title: 'Record Production',
              date: today,
              type: 'production',
              priority: 'low',
              description: 'Daily production reminder'
            });
          }
        }
        break;
      }
    }

    return eventList.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [healthRecords, breedingRecords, feedRecords, productionRecords, animalTypeId, currentMonth, module]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(event.date, selectedDate));
  }, [events, selectedDate]);

  const eventDates = useMemo(() => {
    const dates: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const key = format(event.date, 'yyyy-MM-dd');
      if (!dates[key]) dates[key] = [];
      dates[key].push(event);
    });
    return dates;
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
      case 'checkup':
        return <Syringe className="w-3.5 h-3.5" />;
      case 'birth':
      case 'weaning':
        return <Baby className="w-3.5 h-3.5" />;
      case 'feed':
        return <Wheat className="w-3.5 h-3.5" />;
      case 'production':
        return <Package className="w-3.5 h-3.5" />;
      default:
        return <CalendarDays className="w-3.5 h-3.5" />;
    }
  };

  const getEventColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    switch (type) {
      case 'vaccination':
      case 'checkup':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'birth':
      case 'weaning':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'feed':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'production':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const moduleTitle = {
    feed: 'Feed Schedule',
    health: 'Health Calendar',
    reproduction: 'Breeding Calendar',
    production: 'Production Schedule',
  }[module];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {moduleTitle}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-medium min-w-[80px] text-center">
              {format(currentMonth, 'MMM yyyy')}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border p-2"
            modifiers={{
              hasEvents: (date) => {
                const key = format(date, 'yyyy-MM-dd');
                return !!eventDates[key];
              },
            }}
            modifiersClassNames={{
              hasEvents: 'bg-primary/10 font-semibold',
            }}
            components={{
              DayContent: ({ date }) => {
                const key = format(date, 'yyyy-MM-dd');
                const dayEvents = eventDates[key];
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-xs">{date.getDate()}</span>
                    {dayEvents && dayEvents.length > 0 && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                        <div className={cn(
                          'w-1 h-1 rounded-full',
                          dayEvents.some(e => e.priority === 'high') ? 'bg-destructive' : 'bg-primary'
                        )} />
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              {selectedDate ? format(selectedDate, 'MMM d') : 'Select date'}
            </div>
            <ScrollArea className="h-[180px]">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No events</p>
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        'p-2 rounded-md border text-xs',
                        getEventColor(event.type, event.priority)
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {getEventIcon(event.type)}
                        <span className="font-medium truncate">{event.title}</span>
                      </div>
                      {event.description && (
                        <p className="text-xs opacity-75 mt-0.5">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
