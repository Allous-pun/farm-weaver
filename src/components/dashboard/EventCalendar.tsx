import React, { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFarm } from '@/context/FarmContext';
import { useNotifications } from '@/context/NotificationContext';
import { 
  CalendarDays, 
  Syringe, 
  Baby, 
  AlertTriangle, 
  Stethoscope,
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
  differenceInDays
} from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'vaccination' | 'birth' | 'health' | 'inventory' | 'task';
  priority: 'low' | 'medium' | 'high';
  animalTypeName?: string;
  description?: string;
}

export function EventCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { healthRecords, breedingRecords, animalTypes, animalRecords } = useFarm();
  const { notifications, settings } = useNotifications();

  // Generate calendar events from various sources
  const events = useMemo<CalendarEvent[]>(() => {
    const eventList: CalendarEvent[] = [];
    const today = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Upcoming vaccinations - scheduled based on last vaccination + 90 day cycle
    const vaccinationRecords = healthRecords.filter(r => r.recordType === 'vaccination');
    animalTypes.forEach(animalType => {
      const animalVaccinations = vaccinationRecords
        .filter(r => r.animalTypeId === animalType.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (animalVaccinations.length > 0) {
        const lastVaccination = new Date(animalVaccinations[0].date);
        const nextDue = addDays(lastVaccination, 90);
        const daysUntil = differenceInDays(nextDue, today);
        
        if (nextDue >= monthStart && nextDue <= monthEnd) {
          eventList.push({
            id: `vax-${animalType.id}`,
            title: `${animalType.name} Vaccination`,
            date: nextDue,
            type: 'vaccination',
            priority: daysUntil < 0 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
            animalTypeName: animalType.name,
            description: daysUntil < 0 
              ? 'Overdue vaccination' 
              : `Due in ${daysUntil} days`
          });
        }
      }
    });

    // Expected births
    const pregnancyRecords = breedingRecords.filter(
      r => r.eventType === 'pregnancy' && r.expectedDueDate
    );
    pregnancyRecords.forEach(record => {
      if (!record.expectedDueDate) return;
      
      const dueDate = new Date(record.expectedDueDate);
      const animalType = animalTypes.find(a => a.id === record.animalTypeId);
      const daysUntil = differenceInDays(dueDate, today);
      
      if (dueDate >= monthStart && dueDate <= monthEnd) {
        eventList.push({
          id: `birth-${record.id}`,
          title: `Expected Birth: ${record.femaleName}`,
          date: dueDate,
          type: 'birth',
          priority: daysUntil < 0 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
          animalTypeName: animalType?.name,
          description: daysUntil < 0 
            ? 'Past due date' 
            : `Expected in ${daysUntil} days`
        });
      }
    });

    // Health check reminders
    animalTypes.forEach(animalType => {
      const animalHealthRecords = healthRecords
        .filter(r => r.animalTypeId === animalType.id && r.recordType === 'checkup')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const lastCheckup = animalHealthRecords[0];
      if (lastCheckup) {
        const nextCheckupDue = addDays(new Date(lastCheckup.date), settings.healthCheckIntervalDays);
        
        if (nextCheckupDue >= monthStart && nextCheckupDue <= monthEnd) {
          const daysUntil = differenceInDays(nextCheckupDue, today);
          eventList.push({
            id: `health-${animalType.id}`,
            title: `${animalType.name} Health Check`,
            date: nextCheckupDue,
            type: 'health',
            priority: daysUntil < 0 ? 'high' : 'medium',
            animalTypeName: animalType.name,
            description: daysUntil < 0 
              ? 'Overdue health check' 
              : `Due in ${daysUntil} days`
          });
        }
      }
    });

    // Low inventory alerts (show on current date)
    animalTypes.forEach(animalType => {
      const animalCount = animalRecords.filter(
        r => r.animalTypeId === animalType.id && r.status !== 'sold' && r.status !== 'deceased'
      ).length;
      
      if (animalCount > 0 && animalCount <= settings.lowInventoryThreshold) {
        if (today >= monthStart && today <= monthEnd) {
          eventList.push({
            id: `inventory-${animalType.id}`,
            title: `Low Stock: ${animalType.name}`,
            date: today,
            type: 'inventory',
            priority: animalCount <= 5 ? 'high' : 'medium',
            animalTypeName: animalType.name,
            description: `Only ${animalCount} remaining`
          });
        }
      }
    });

    return eventList.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [healthRecords, breedingRecords, animalTypes, animalRecords, currentMonth, settings]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(event.date, selectedDate));
  }, [events, selectedDate]);

  // Get dates that have events for highlighting
  const eventDates = useMemo(() => {
    const dates: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const key = format(event.date, 'yyyy-MM-dd');
      if (!dates[key]) dates[key] = [];
      dates[key].push(event);
    });
    return dates;
  }, [events]);

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'vaccination':
        return <Syringe className="w-4 h-4" />;
      case 'birth':
        return <Baby className="w-4 h-4" />;
      case 'health':
        return <Stethoscope className="w-4 h-4" />;
      case 'inventory':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: CalendarEvent['type'], priority: CalendarEvent['priority']) => {
    if (priority === 'high') {
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    switch (type) {
      case 'vaccination':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'birth':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'health':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'inventory':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityBadge = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Farm Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[1fr,300px] gap-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasEvents: (date) => {
                  const key = format(date, 'yyyy-MM-dd');
                  return !!eventDates[key];
                },
                hasHighPriority: (date) => {
                  const key = format(date, 'yyyy-MM-dd');
                  return eventDates[key]?.some(e => e.priority === 'high') || false;
                }
              }}
              modifiersClassNames={{
                hasEvents: 'bg-primary/10 font-semibold',
                hasHighPriority: 'bg-destructive/10 text-destructive font-bold'
              }}
              components={{
                DayContent: ({ date }) => {
                  const key = format(date, 'yyyy-MM-dd');
                  const dayEvents = eventDates[key];
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span>{date.getDate()}</span>
                      {dayEvents && dayEvents.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                event.priority === 'high' ? 'bg-destructive' :
                                event.type === 'vaccination' ? 'bg-blue-500' :
                                event.type === 'birth' ? 'bg-pink-500' :
                                event.type === 'health' ? 'bg-green-500' :
                                'bg-amber-500'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </div>

          {/* Events List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedDate 
                  ? format(selectedDate, 'MMM d, yyyy')
                  : 'Select a date'}
              </h3>
              {selectedDateEvents.length > 0 && (
                <Badge variant="secondary">{selectedDateEvents.length} events</Badge>
              )}
            </div>
            
            <ScrollArea className="h-[300px]">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No events on this date</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        getEventColor(event.type, event.priority)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{event.title}</span>
                            {getPriorityBadge(event.priority)}
                          </div>
                          {event.animalTypeName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.animalTypeName}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs mt-1 opacity-80">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Legend */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Event Types</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Vaccination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>Birth</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Health Check</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Inventory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
