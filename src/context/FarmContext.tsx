import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AnimalType, 
  AnimalRecord, 
  DashboardStats, 
  Farm,
  FeedRecord,
  HealthRecord,
  BreedingRecord,
  GeneticsRecord,
  InventoryRecord,
  ProductionRecord
} from '@/types/animal';

interface User {
  id: string;
  name: string;
  email: string;
}

interface FarmContextType {
  user: User | null;
  farms: Farm[];
  selectedFarm: Farm | null;
  animalTypes: AnimalType[];
  selectedAnimalType: AnimalType | null;
  animalRecords: AnimalRecord[];
  feedRecords: FeedRecord[];
  healthRecords: HealthRecord[];
  breedingRecords: BreedingRecord[];
  geneticsRecords: GeneticsRecord[];
  inventoryRecords: InventoryRecord[];
  productionRecords: ProductionRecord[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string, initialFarmName: string) => void;
  logout: () => void;
  addFarm: (name: string, location?: string) => Farm;
  updateFarm: (id: string, updates: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  selectFarm: (id: string | null) => void;
  addAnimalType: (animalType: Omit<AnimalType, 'id' | 'createdAt' | 'farmId'>) => void;
  updateAnimalType: (id: string, updates: Partial<AnimalType>) => void;
  deleteAnimalType: (id: string) => void;
  selectAnimalType: (id: string | null) => void;
  addAnimalRecord: (record: Omit<AnimalRecord, 'id'>) => void;
  updateAnimalRecord: (id: string, updates: Partial<AnimalRecord>) => void;
  deleteAnimalRecord: (id: string) => void;
  // Feed Records
  addFeedRecord: (record: Omit<FeedRecord, 'id' | 'createdAt'>) => void;
  updateFeedRecord: (id: string, updates: Partial<FeedRecord>) => void;
  deleteFeedRecord: (id: string) => void;
  // Health Records
  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'createdAt'>) => void;
  updateHealthRecord: (id: string, updates: Partial<HealthRecord>) => void;
  deleteHealthRecord: (id: string) => void;
  // Breeding Records
  addBreedingRecord: (record: Omit<BreedingRecord, 'id' | 'createdAt'>) => void;
  updateBreedingRecord: (id: string, updates: Partial<BreedingRecord>) => void;
  deleteBreedingRecord: (id: string) => void;
  // Genetics Records
  addGeneticsRecord: (record: Omit<GeneticsRecord, 'id' | 'createdAt'>) => void;
  updateGeneticsRecord: (id: string, updates: Partial<GeneticsRecord>) => void;
  deleteGeneticsRecord: (id: string) => void;
  // Inventory Records
  addInventoryRecord: (record: Omit<InventoryRecord, 'id' | 'createdAt'>) => void;
  updateInventoryRecord: (id: string, updates: Partial<InventoryRecord>) => void;
  deleteInventoryRecord: (id: string) => void;
  // Production Records
  addProductionRecord: (record: Omit<ProductionRecord, 'id' | 'createdAt'>) => void;
  updateProductionRecord: (id: string, updates: Partial<ProductionRecord>) => void;
  deleteProductionRecord: (id: string) => void;
  getStats: (animalTypeId: string) => DashboardStats;
  getModuleRecords: (module: string, animalTypeId: string) => any[];
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const STORAGE_KEYS = {
  user: 'farmapp_user',
  farms: 'farmapp_farms',
  selectedFarmId: 'farmapp_selected_farm',
  animalTypes: 'farmapp_animal_types',
  animalRecords: 'farmapp_animal_records',
  selectedAnimalTypeId: 'farmapp_selected_animal_type',
  feedRecords: 'farmapp_feed_records',
  healthRecords: 'farmapp_health_records',
  breedingRecords: 'farmapp_breeding_records',
  geneticsRecords: 'farmapp_genetics_records',
  inventoryRecords: 'farmapp_inventory_records',
  productionRecords: 'farmapp_production_records',
};

export function FarmProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    return stored ? JSON.parse(stored) : null;
  });

  const [farms, setFarms] = useState<Farm[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.farms);
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.selectedFarmId);
    const storedFarms = localStorage.getItem(STORAGE_KEYS.farms);
    if (storedId && storedFarms) {
      const farmList = JSON.parse(storedFarms);
      return farmList.find((f: Farm) => f.id === storedId) || null;
    }
    return null;
  });

  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.animalTypes);
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedAnimalType, setSelectedAnimalType] = useState<AnimalType | null>(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.selectedAnimalTypeId);
    const storedTypes = localStorage.getItem(STORAGE_KEYS.animalTypes);
    if (storedId && storedTypes) {
      const types = JSON.parse(storedTypes);
      return types.find((t: AnimalType) => t.id === storedId) || null;
    }
    return null;
  });

  const [animalRecords, setAnimalRecords] = useState<AnimalRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.animalRecords);
    return stored ? JSON.parse(stored) : [];
  });

  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.feedRecords);
    return stored ? JSON.parse(stored) : [];
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.healthRecords);
    return stored ? JSON.parse(stored) : [];
  });

  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.breedingRecords);
    return stored ? JSON.parse(stored) : [];
  });

  const [geneticsRecords, setGeneticsRecords] = useState<GeneticsRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.geneticsRecords);
    return stored ? JSON.parse(stored) : [];
  });

  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.inventoryRecords);
    return stored ? JSON.parse(stored) : [];
  });

  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.productionRecords);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.farms, JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    if (selectedFarm) {
      localStorage.setItem(STORAGE_KEYS.selectedFarmId, selectedFarm.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedFarmId);
    }
  }, [selectedFarm]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.animalTypes, JSON.stringify(animalTypes));
  }, [animalTypes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.animalRecords, JSON.stringify(animalRecords));
  }, [animalRecords]);

  useEffect(() => {
    if (selectedAnimalType) {
      localStorage.setItem(STORAGE_KEYS.selectedAnimalTypeId, selectedAnimalType.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedAnimalTypeId);
    }
  }, [selectedAnimalType]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.feedRecords, JSON.stringify(feedRecords));
  }, [feedRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.healthRecords, JSON.stringify(healthRecords));
  }, [healthRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.breedingRecords, JSON.stringify(breedingRecords));
  }, [breedingRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.geneticsRecords, JSON.stringify(geneticsRecords));
  }, [geneticsRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.inventoryRecords, JSON.stringify(inventoryRecords));
  }, [inventoryRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.productionRecords, JSON.stringify(productionRecords));
  }, [productionRecords]);

  // Filter animal types by selected farm
  const farmAnimalTypes = selectedFarm 
    ? animalTypes.filter(t => t.farmId === selectedFarm.id)
    : [];

  const login = (email: string, _password: string) => {
    const mockUser: User = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0],
      email,
    };
    setUser(mockUser);
    
    // Auto-select first farm if available
    if (farms.length > 0 && !selectedFarm) {
      setSelectedFarm(farms[0]);
    }
  };

  const register = (name: string, email: string, _password: string, initialFarmName: string) => {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      email,
    };
    setUser(newUser);

    // Create initial farm
    const newFarm: Farm = {
      id: 'farm_' + Date.now(),
      name: initialFarmName,
      createdAt: new Date(),
    };
    setFarms([newFarm]);
    setSelectedFarm(newFarm);
  };

  const logout = () => {
    setUser(null);
    setSelectedFarm(null);
    setSelectedAnimalType(null);
  };

  const addFarm = (name: string, location?: string): Farm => {
    const newFarm: Farm = {
      id: 'farm_' + Date.now(),
      name,
      location,
      createdAt: new Date(),
    };
    setFarms(prev => [...prev, newFarm]);
    return newFarm;
  };

  const updateFarm = (id: string, updates: Partial<Farm>) => {
    setFarms(prev =>
      prev.map(farm => (farm.id === id ? { ...farm, ...updates } : farm))
    );
    if (selectedFarm?.id === id) {
      setSelectedFarm(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteFarm = (id: string) => {
    setFarms(prev => prev.filter(farm => farm.id !== id));
    // Delete all animal types and records for this farm
    const farmTypeIds = animalTypes.filter(t => t.farmId === id).map(t => t.id);
    setAnimalTypes(prev => prev.filter(type => type.farmId !== id));
    setAnimalRecords(prev => prev.filter(record => !farmTypeIds.includes(record.animalTypeId)));
    setFeedRecords(prev => prev.filter(r => !farmTypeIds.includes(r.animalTypeId)));
    setHealthRecords(prev => prev.filter(r => !farmTypeIds.includes(r.animalTypeId)));
    setBreedingRecords(prev => prev.filter(r => !farmTypeIds.includes(r.animalTypeId)));
    setGeneticsRecords(prev => prev.filter(r => !farmTypeIds.includes(r.animalTypeId)));
    setInventoryRecords(prev => prev.filter(r => !farmTypeIds.includes(r.animalTypeId)));
    setProductionRecords(prev => prev.filter(r => !farmTypeIds.includes(r.animalTypeId)));
    
    if (selectedFarm?.id === id) {
      const remainingFarms = farms.filter(f => f.id !== id);
      setSelectedFarm(remainingFarms[0] || null);
    }
  };

  const selectFarm = (id: string | null) => {
    if (id === null) {
      setSelectedFarm(null);
      setSelectedAnimalType(null);
    } else {
      const farm = farms.find(f => f.id === id);
      setSelectedFarm(farm || null);
      setSelectedAnimalType(null);
    }
  };

  const addAnimalType = (animalType: Omit<AnimalType, 'id' | 'createdAt' | 'farmId'>) => {
    if (!selectedFarm) return;
    
    const newType: AnimalType = {
      ...animalType,
      id: 'animal_' + Date.now(),
      farmId: selectedFarm.id,
      createdAt: new Date(),
    };
    setAnimalTypes(prev => [...prev, newType]);
    
    // Generate mock records for the new animal type
    generateMockRecords(newType);
    
    return newType;
  };

  const generateMockRecords = (animalType: AnimalType) => {
    const mockCount = Math.floor(Math.random() * 15) + 5;
    const newRecords: AnimalRecord[] = [];
    
    for (let i = 0; i < mockCount; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const statuses: AnimalRecord['status'][] = ['healthy', 'healthy', 'healthy', 'sick', 'quarantine'];
      
      newRecords.push({
        id: `record_${Date.now()}_${i}`,
        animalTypeId: animalType.id,
        name: `${animalType.name} #${i + 1}`,
        gender,
        birthDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2),
        weight: Math.floor(Math.random() * 50) + 10,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
    
    setAnimalRecords(prev => [...prev, ...newRecords]);
  };

  const updateAnimalType = (id: string, updates: Partial<AnimalType>) => {
    setAnimalTypes(prev =>
      prev.map(type => (type.id === id ? { ...type, ...updates } : type))
    );
    if (selectedAnimalType?.id === id) {
      setSelectedAnimalType(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteAnimalType = (id: string) => {
    setAnimalTypes(prev => prev.filter(type => type.id !== id));
    setAnimalRecords(prev => prev.filter(record => record.animalTypeId !== id));
    setFeedRecords(prev => prev.filter(r => r.animalTypeId !== id));
    setHealthRecords(prev => prev.filter(r => r.animalTypeId !== id));
    setBreedingRecords(prev => prev.filter(r => r.animalTypeId !== id));
    setGeneticsRecords(prev => prev.filter(r => r.animalTypeId !== id));
    setInventoryRecords(prev => prev.filter(r => r.animalTypeId !== id));
    setProductionRecords(prev => prev.filter(r => r.animalTypeId !== id));
    if (selectedAnimalType?.id === id) {
      setSelectedAnimalType(null);
    }
  };

  const selectAnimalType = (id: string | null) => {
    if (id === null) {
      setSelectedAnimalType(null);
    } else {
      const type = animalTypes.find(t => t.id === id);
      setSelectedAnimalType(type || null);
    }
  };

  const addAnimalRecord = (record: Omit<AnimalRecord, 'id'>) => {
    const newRecord: AnimalRecord = {
      ...record,
      id: 'record_' + Date.now(),
    };
    setAnimalRecords(prev => [...prev, newRecord]);
  };

  const updateAnimalRecord = (id: string, updates: Partial<AnimalRecord>) => {
    setAnimalRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteAnimalRecord = (id: string) => {
    setAnimalRecords(prev => prev.filter(record => record.id !== id));
  };

  // Feed Records CRUD
  const addFeedRecord = (record: Omit<FeedRecord, 'id' | 'createdAt'>) => {
    const newRecord: FeedRecord = {
      ...record,
      id: 'feed_' + Date.now(),
      createdAt: new Date(),
    };
    setFeedRecords(prev => [...prev, newRecord]);
  };

  const updateFeedRecord = (id: string, updates: Partial<FeedRecord>) => {
    setFeedRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteFeedRecord = (id: string) => {
    setFeedRecords(prev => prev.filter(record => record.id !== id));
  };

  // Health Records CRUD
  const addHealthRecord = (record: Omit<HealthRecord, 'id' | 'createdAt'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: 'health_' + Date.now(),
      createdAt: new Date(),
    };
    setHealthRecords(prev => [...prev, newRecord]);
  };

  const updateHealthRecord = (id: string, updates: Partial<HealthRecord>) => {
    setHealthRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteHealthRecord = (id: string) => {
    setHealthRecords(prev => prev.filter(record => record.id !== id));
  };

  // Breeding Records CRUD
  const addBreedingRecord = (record: Omit<BreedingRecord, 'id' | 'createdAt'>) => {
    const newRecord: BreedingRecord = {
      ...record,
      id: 'breeding_' + Date.now(),
      createdAt: new Date(),
    };
    setBreedingRecords(prev => [...prev, newRecord]);
  };

  const updateBreedingRecord = (id: string, updates: Partial<BreedingRecord>) => {
    setBreedingRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteBreedingRecord = (id: string) => {
    setBreedingRecords(prev => prev.filter(record => record.id !== id));
  };

  // Genetics Records CRUD
  const addGeneticsRecord = (record: Omit<GeneticsRecord, 'id' | 'createdAt'>) => {
    const newRecord: GeneticsRecord = {
      ...record,
      id: 'genetics_' + Date.now(),
      createdAt: new Date(),
    };
    setGeneticsRecords(prev => [...prev, newRecord]);
  };

  const updateGeneticsRecord = (id: string, updates: Partial<GeneticsRecord>) => {
    setGeneticsRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteGeneticsRecord = (id: string) => {
    setGeneticsRecords(prev => prev.filter(record => record.id !== id));
  };

  // Inventory Records CRUD
  const addInventoryRecord = (record: Omit<InventoryRecord, 'id' | 'createdAt'>) => {
    const newRecord: InventoryRecord = {
      ...record,
      id: 'inventory_' + Date.now(),
      createdAt: new Date(),
    };
    setInventoryRecords(prev => [...prev, newRecord]);
  };

  const updateInventoryRecord = (id: string, updates: Partial<InventoryRecord>) => {
    setInventoryRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteInventoryRecord = (id: string) => {
    setInventoryRecords(prev => prev.filter(record => record.id !== id));
  };

  // Production Records CRUD
  const addProductionRecord = (record: Omit<ProductionRecord, 'id' | 'createdAt'>) => {
    const newRecord: ProductionRecord = {
      ...record,
      id: 'production_' + Date.now(),
      createdAt: new Date(),
    };
    setProductionRecords(prev => [...prev, newRecord]);
  };

  const updateProductionRecord = (id: string, updates: Partial<ProductionRecord>) => {
    setProductionRecords(prev =>
      prev.map(record => (record.id === id ? { ...record, ...updates } : record))
    );
  };

  const deleteProductionRecord = (id: string) => {
    setProductionRecords(prev => prev.filter(record => record.id !== id));
  };

  const getModuleRecords = (module: string, animalTypeId: string) => {
    switch (module) {
      case 'feed':
        return feedRecords.filter(r => r.animalTypeId === animalTypeId);
      case 'health':
        return healthRecords.filter(r => r.animalTypeId === animalTypeId);
      case 'reproduction':
        return breedingRecords.filter(r => r.animalTypeId === animalTypeId);
      case 'genetics':
        return geneticsRecords.filter(r => r.animalTypeId === animalTypeId);
      case 'inventory':
        return inventoryRecords.filter(r => r.animalTypeId === animalTypeId);
      case 'production':
        return productionRecords.filter(r => r.animalTypeId === animalTypeId);
      default:
        return [];
    }
  };

  const getStats = (animalTypeId: string): DashboardStats => {
    const records = animalRecords.filter(r => r.animalTypeId === animalTypeId);
    const healthyCount = records.filter(r => r.status === 'healthy').length;
    const sickCount = records.filter(r => r.status === 'sick' || r.status === 'quarantine').length;
    
    return {
      totalCount: records.length,
      healthyCount,
      sickCount,
      productionToday: Math.floor(Math.random() * 100) + 20,
      alertsCount: sickCount + Math.floor(Math.random() * 3),
    };
  };

  return (
    <FarmContext.Provider
      value={{
        user,
        farms,
        selectedFarm,
        animalTypes: farmAnimalTypes,
        selectedAnimalType,
        animalRecords,
        feedRecords,
        healthRecords,
        breedingRecords,
        geneticsRecords,
        inventoryRecords,
        productionRecords,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        addFarm,
        updateFarm,
        deleteFarm,
        selectFarm,
        addAnimalType,
        updateAnimalType,
        deleteAnimalType,
        selectAnimalType,
        addAnimalRecord,
        updateAnimalRecord,
        deleteAnimalRecord,
        addFeedRecord,
        updateFeedRecord,
        deleteFeedRecord,
        addHealthRecord,
        updateHealthRecord,
        deleteHealthRecord,
        addBreedingRecord,
        updateBreedingRecord,
        deleteBreedingRecord,
        addGeneticsRecord,
        updateGeneticsRecord,
        deleteGeneticsRecord,
        addInventoryRecord,
        updateInventoryRecord,
        deleteInventoryRecord,
        addProductionRecord,
        updateProductionRecord,
        deleteProductionRecord,
        getStats,
        getModuleRecords,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}