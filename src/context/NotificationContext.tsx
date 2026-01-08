import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFarm } from './FarmContext';
import { addDays, differenceInDays, isAfter, isBefore } from 'date-fns';

export type NotificationType = 'vaccination' | 'birth' | 'inventory' | 'health' | 'feed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  animalTypeId?: string;
  animalTypeName?: string;
  date: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
}

interface NotificationSettings {
  vaccinationReminders: boolean;
  vaccinationDaysBefore: number;
  birthReminders: boolean;
  birthDaysBefore: number;
  lowInventoryAlerts: boolean;
  lowInventoryThreshold: number;
  healthCheckReminders: boolean;
  healthCheckIntervalDays: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

const defaultSettings: NotificationSettings = {
  vaccinationReminders: true,
  vaccinationDaysBefore: 7,
  birthReminders: true,
  birthDaysBefore: 14,
  lowInventoryAlerts: true,
  lowInventoryThreshold: 10,
  healthCheckReminders: true,
  healthCheckIntervalDays: 30,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NOTIFICATIONS: 'farmflow_notifications',
  NOTIFICATION_SETTINGS: 'farmflow_notification_settings',
  READ_NOTIFICATIONS: 'farmflow_read_notifications',
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { healthRecords, breedingRecords, inventoryRecords, animalTypes, animalRecords } = useFarm();
  
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.READ_NOTIFICATIONS);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [clearedNotifications, setClearedNotifications] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('farmflow_cleared_notifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Persist read notifications
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, JSON.stringify([...readNotifications]));
  }, [readNotifications]);

  // Persist cleared notifications
  useEffect(() => {
    localStorage.setItem('farmflow_cleared_notifications', JSON.stringify([...clearedNotifications]));
  }, [clearedNotifications]);

  // Generate notifications based on data
  const notifications: Notification[] = React.useMemo(() => {
    const notifs: Notification[] = [];
    const today = new Date();

    // Vaccination reminders - check last vaccination and schedule next
    if (settings.vaccinationReminders) {
      const vaccinationRecords = healthRecords.filter(r => r.recordType === 'vaccination');
      
      animalTypes.forEach(animalType => {
        const animalVaccinations = vaccinationRecords
          .filter(r => r.animalTypeId === animalType.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (animalVaccinations.length > 0) {
          const lastVaccination = new Date(animalVaccinations[0].date);
          const nextDue = addDays(lastVaccination, 90); // Assume 90-day vaccination cycle
          const daysUntil = differenceInDays(nextDue, today);
          
          if (daysUntil <= settings.vaccinationDaysBefore && daysUntil >= -7) {
            notifs.push({
              id: `vax-${animalType.id}-${lastVaccination.getTime()}`,
              type: 'vaccination',
              title: 'Vaccination Due',
              message: `${animalType.name} vaccination is ${daysUntil < 0 ? 'overdue' : `due in ${daysUntil} days`}`,
              animalTypeId: animalType.id,
              animalTypeName: animalType.name,
              date: nextDue,
              priority: daysUntil < 0 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
              read: false,
              createdAt: today,
            });
          }
        }
      });
    }

    // Expected births
    if (settings.birthReminders) {
      const pregnancyRecords = breedingRecords.filter(
        r => r.eventType === 'pregnancy' && r.expectedDueDate
      );
      
      pregnancyRecords.forEach(record => {
        if (!record.expectedDueDate) return;
        
        const dueDate = new Date(record.expectedDueDate);
        const daysUntil = differenceInDays(dueDate, today);
        const animalType = animalTypes.find(a => a.id === record.animalTypeId);
        
        if (daysUntil <= settings.birthDaysBefore && daysUntil >= -3) {
          notifs.push({
            id: `birth-${record.id}`,
            type: 'birth',
            title: 'Expected Birth',
            message: `${record.femaleName} (${animalType?.name || 'Unknown'}) ${daysUntil < 0 ? 'is past due date' : `expected to give birth in ${daysUntil} days`}`,
            animalTypeId: record.animalTypeId,
            animalTypeName: animalType?.name,
            date: dueDate,
            priority: daysUntil < 0 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
            read: false,
            createdAt: today,
          });
        }
      });
    }

    // Low inventory alerts
    if (settings.lowInventoryAlerts) {
      animalTypes.forEach(animalType => {
        const animalCount = animalRecords.filter(
          r => r.animalTypeId === animalType.id && r.status !== 'sold' && r.status !== 'deceased'
        ).length;
        
        if (animalCount > 0 && animalCount <= settings.lowInventoryThreshold) {
          notifs.push({
            id: `inventory-low-${animalType.id}`,
            type: 'inventory',
            title: 'Low Stock Alert',
            message: `${animalType.name} stock is low: only ${animalCount} remaining`,
            animalTypeId: animalType.id,
            animalTypeName: animalType.name,
            date: today,
            priority: animalCount <= 5 ? 'high' : 'medium',
            read: false,
            createdAt: today,
          });
        }
      });
    }

    // Health check reminders
    if (settings.healthCheckReminders) {
      animalTypes.forEach(animalType => {
        const animalHealthRecords = healthRecords
          .filter(r => r.animalTypeId === animalType.id && r.recordType === 'checkup')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const lastCheckup = animalHealthRecords[0];
        const daysSinceCheckup = lastCheckup 
          ? differenceInDays(today, new Date(lastCheckup.date))
          : settings.healthCheckIntervalDays + 1;
        
        if (daysSinceCheckup >= settings.healthCheckIntervalDays) {
          notifs.push({
            id: `health-${animalType.id}`,
            type: 'health',
            title: 'Health Check Due',
            message: `${animalType.name} haven't had a health check in ${daysSinceCheckup} days`,
            animalTypeId: animalType.id,
            animalTypeName: animalType.name,
            date: today,
            priority: daysSinceCheckup > settings.healthCheckIntervalDays * 1.5 ? 'high' : 'medium',
            read: false,
            createdAt: today,
          });
        }
      });
    }

    // Apply read status and filter cleared
    return notifs
      .filter(n => !clearedNotifications.has(n.id))
      .map(n => ({
        ...n,
        read: readNotifications.has(n.id),
      }))
      .sort((a, b) => {
        // Sort by priority first, then by date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [healthRecords, breedingRecords, inventoryRecords, animalTypes, animalRecords, settings, readNotifications, clearedNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setReadNotifications(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadNotifications(prev => new Set([...prev, ...notifications.map(n => n.id)]));
  };

  const clearNotification = (id: string) => {
    setClearedNotifications(prev => new Set([...prev, id]));
  };

  const clearAllNotifications = () => {
    setClearedNotifications(prev => new Set([...prev, ...notifications.map(n => n.id)]));
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        updateSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
