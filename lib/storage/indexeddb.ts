/**
 * IndexedDB Wrapper for Local Persistence
 * 
 * Provides a clean abstraction over IndexedDB for storing application data locally.
 * Data persists across browser sessions and page refreshes.
 */

const DB_NAME = 'hospitality-admin-db';
const DB_VERSION = 1;

// Store names for each entity type
export const STORES = {
  COMPANIES: 'companies',
  LOCATIONS: 'locations',
  CUSTOMERS: 'customers',
  STAFF: 'staff',
  ROOMS: 'rooms',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

/**
 * Initialize the IndexedDB database
 */
export function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      const stores = Object.values(STORES);
      
      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const objectStore = db.createObjectStore(storeName, { keyPath: 'id' });
          
          // Create indices for common query patterns
          switch (storeName) {
            case STORES.LOCATIONS:
              objectStore.createIndex('companyId', 'companyId', { unique: false });
              objectStore.createIndex('status', 'status', { unique: false });
              break;
            
            case STORES.CUSTOMERS:
              objectStore.createIndex('locationId', 'locationId', { unique: false });
              objectStore.createIndex('companyId', 'companyId', { unique: false });
              objectStore.createIndex('email', 'email', { unique: true });
              objectStore.createIndex('status', 'status', { unique: false });
              objectStore.createIndex('membershipTier', 'membershipTier', { unique: false });
              break;
            
            case STORES.STAFF:
              objectStore.createIndex('locationId', 'locationId', { unique: false });
              objectStore.createIndex('companyId', 'companyId', { unique: false });
              objectStore.createIndex('email', 'email', { unique: true });
              objectStore.createIndex('status', 'status', { unique: false });
              break;
            
            case STORES.ROOMS:
              objectStore.createIndex('locationId', 'locationId', { unique: false });
              objectStore.createIndex('companyId', 'companyId', { unique: false });
              objectStore.createIndex('status', 'status', { unique: false });
              break;
            
            case STORES.SERVICES:
              objectStore.createIndex('locationId', 'locationId', { unique: false });
              objectStore.createIndex('companyId', 'companyId', { unique: false });
              objectStore.createIndex('status', 'status', { unique: false });
              break;
            
            case STORES.APPOINTMENTS:
              objectStore.createIndex('locationId', 'locationId', { unique: false });
              objectStore.createIndex('companyId', 'companyId', { unique: false });
              objectStore.createIndex('customerId', 'customerId', { unique: false });
              objectStore.createIndex('staffId', 'staffId', { unique: false });
              objectStore.createIndex('serviceId', 'serviceId', { unique: false });
              objectStore.createIndex('roomId', 'roomId', { unique: false });
              objectStore.createIndex('date', 'date', { unique: false });
              objectStore.createIndex('status', 'status', { unique: false });
              objectStore.createIndex('startTime', 'startTime', { unique: false });
              break;
            
            case STORES.NOTIFICATIONS:
              objectStore.createIndex('createdAt', 'createdAt', { unique: false });
              objectStore.createIndex('read', 'read', { unique: false });
              break;
          }
        }
      });
    };
  });
}

/**
 * Generic IndexedDB operations
 */
class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      this.dbPromise = initDatabase();
    }
  }

  private async getDb(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is only available in the browser');
    }
    
    if (!this.dbPromise) {
      this.dbPromise = initDatabase();
    }
    
    return this.dbPromise;
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all items from ${storeName}`));
      };
    });
  }

  /**
   * Get a single item by ID
   */
  async getById<T>(storeName: StoreName, id: string): Promise<T | undefined> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get item from ${storeName}`));
      };
    });
  }

  /**
   * Get items by index
   */
  async getByIndex<T>(
    storeName: StoreName,
    indexName: string,
    indexValue: any
  ): Promise<T[]> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(indexValue);

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get items by index from ${storeName}`));
      };
    });
  }

  /**
   * Add or update an item
   */
  async put<T>(storeName: StoreName, item: T): Promise<T> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        reject(new Error(`Failed to put item in ${storeName}`));
      };
    });
  }

  /**
   * Add multiple items
   */
  async putMany<T>(storeName: StoreName, items: T[]): Promise<T[]> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const promises = items.map(item => {
        return new Promise<void>((itemResolve, itemReject) => {
          const request = store.put(item);
          request.onsuccess = () => itemResolve();
          request.onerror = () => itemReject(new Error('Failed to put item'));
        });
      });

      Promise.all(promises)
        .then(() => resolve(items))
        .catch(() => reject(new Error(`Failed to put items in ${storeName}`)));
    });
  }

  /**
   * Delete an item by ID
   */
  async delete(storeName: StoreName, id: string): Promise<void> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete item from ${storeName}`));
      };
    });
  }

  /**
   * Clear all items from a store
   */
  async clear(storeName: StoreName): Promise<void> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}`));
      };
    });
  }

  /**
   * Count items in a store
   */
  async count(storeName: StoreName): Promise<number> {
    const db = await this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count items in ${storeName}`));
      };
    });
  }

  /**
   * Clear all data from database
   */
  async clearAll(): Promise<void> {
    const stores = Object.values(STORES);
    await Promise.all(stores.map(store => this.clear(store)));
  }

  /**
   * Check if database has been initialized with seed data
   */
  async isInitialized(): Promise<boolean> {
    try {
      const companiesCount = await this.count(STORES.COMPANIES);
      return companiesCount > 0;
    } catch {
      return false;
    }
  }

  /**
   * Advanced query with filtering
   */
  async query<T>(
    storeName: StoreName,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const all = await this.getAll<T>(storeName);
    return all.filter(predicate);
  }
}

// Export singleton instance
export const db = new IndexedDBStorage();

/**
 * Helper to check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined';
}

/**
 * Development helper to inspect database
 */
export async function debugDatabase() {
  if (typeof window === 'undefined') return;
  
  console.group('🗄️ Database Debug Info');
  
  try {
    const stores = Object.values(STORES);
    
    for (const store of stores) {
      const count = await db.count(store);
      console.log(`${store}: ${count} items`);
    }
    
    const initialized = await db.isInitialized();
    console.log(`Initialized: ${initialized}`);
  } catch (error) {
    console.error('Error debugging database:', error);
  }
  
  console.groupEnd();
}

/**
 * Load seed data into the database
 */
export async function loadSeedData() {
  try {
    const { seedData } = await import('./seed-data');
    
    // Load in dependency order
    await db.putMany(STORES.COMPANIES, seedData.companies);
    await db.putMany(STORES.LOCATIONS, seedData.locations);
    await db.putMany(STORES.CUSTOMERS, seedData.customers);
    await db.putMany(STORES.STAFF, seedData.staff);
    await db.putMany(STORES.ROOMS, seedData.rooms);
    await db.putMany(STORES.SERVICES, seedData.services);
    await db.putMany(STORES.APPOINTMENTS, seedData.appointments);
    await db.putMany(STORES.USERS, seedData.users);
    
    console.log('✅ Seed data loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load seed data:', error);
    throw error;
  }
}

/**
 * Initialize database with seed data if empty
 */
export async function initializeWithSeedData() {
  const isInitialized = await db.isInitialized();
  
  if (!isInitialized) {
    console.log('🌱 Database empty, loading seed data...');
    await loadSeedData();
  } else {
    console.log('✅ Database already initialized');
  }
}

/**
 * Reset database (for development)
 */
export async function resetDatabase() {
  await db.clearAll();
  console.log('🗑️ Database cleared');
  await loadSeedData();
  console.log('🌱 Database reset with fresh seed data');
}

// Expose debug functions globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__debugDB = debugDatabase;
  (window as any).__resetDB = resetDatabase;
  (window as any).__loadSeedData = loadSeedData;
}
