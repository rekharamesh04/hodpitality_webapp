module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/providers/theme-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/providers/theme-provider.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
}),
"[project]/providers/query-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QueryProvider",
    ()=>QueryProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query-devtools/build/modern/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function QueryProvider({ children }) {
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    refetchOnWindowFocus: false,
                    retry: 1
                }
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: [
            children,
            ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReactQueryDevtools"], {
                initialIsOpen: false
            }, void 0, false, {
                fileName: "[project]/providers/query-provider.tsx",
                lineNumber: 24,
                columnNumber: 50
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/providers/query-provider.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/providers/index.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$theme$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/providers/theme-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$query$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/providers/query-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$theme$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "light",
        enableSystem: true,
        disableTransitionOnChange: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$query$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryProvider"], {
            children: [
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
                    position: "top-right",
                    richColors: true,
                    closeButton: true
                }, void 0, false, {
                    fileName: "[project]/providers/index.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/providers/index.tsx",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/providers/index.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * IndexedDB Wrapper for Local Persistence
 * 
 * Provides a clean abstraction over IndexedDB for storing application data locally.
 * Data persists across browser sessions and page refreshes.
 */ __turbopack_context__.s([
    "STORES",
    ()=>STORES,
    "db",
    ()=>db,
    "debugDatabase",
    ()=>debugDatabase,
    "initDatabase",
    ()=>initDatabase,
    "initializeWithSeedData",
    ()=>initializeWithSeedData,
    "isIndexedDBSupported",
    ()=>isIndexedDBSupported,
    "loadSeedData",
    ()=>loadSeedData,
    "resetDatabase",
    ()=>resetDatabase
]);
const DB_NAME = 'hospitality-admin-db';
const DB_VERSION = 1;
const STORES = {
    COMPANIES: 'companies',
    LOCATIONS: 'locations',
    CUSTOMERS: 'customers',
    STAFF: 'staff',
    ROOMS: 'rooms',
    SERVICES: 'services',
    APPOINTMENTS: 'appointments',
    USERS: 'users',
    NOTIFICATIONS: 'notifications',
    SETTINGS: 'settings'
};
function initDatabase() {
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = ()=>{
            reject(new Error('Failed to open IndexedDB'));
        };
        request.onsuccess = ()=>{
            resolve(request.result);
        };
        request.onupgradeneeded = (event)=>{
            const db = event.target.result;
            // Create object stores if they don't exist
            const stores = Object.values(STORES);
            stores.forEach((storeName)=>{
                if (!db.objectStoreNames.contains(storeName)) {
                    const objectStore = db.createObjectStore(storeName, {
                        keyPath: 'id'
                    });
                    // Create indices for common query patterns
                    switch(storeName){
                        case STORES.LOCATIONS:
                            objectStore.createIndex('companyId', 'companyId', {
                                unique: false
                            });
                            objectStore.createIndex('status', 'status', {
                                unique: false
                            });
                            break;
                        case STORES.CUSTOMERS:
                            objectStore.createIndex('locationId', 'locationId', {
                                unique: false
                            });
                            objectStore.createIndex('companyId', 'companyId', {
                                unique: false
                            });
                            objectStore.createIndex('email', 'email', {
                                unique: true
                            });
                            objectStore.createIndex('status', 'status', {
                                unique: false
                            });
                            objectStore.createIndex('membershipTier', 'membershipTier', {
                                unique: false
                            });
                            break;
                        case STORES.STAFF:
                            objectStore.createIndex('locationId', 'locationId', {
                                unique: false
                            });
                            objectStore.createIndex('companyId', 'companyId', {
                                unique: false
                            });
                            objectStore.createIndex('email', 'email', {
                                unique: true
                            });
                            objectStore.createIndex('status', 'status', {
                                unique: false
                            });
                            break;
                        case STORES.ROOMS:
                            objectStore.createIndex('locationId', 'locationId', {
                                unique: false
                            });
                            objectStore.createIndex('companyId', 'companyId', {
                                unique: false
                            });
                            objectStore.createIndex('status', 'status', {
                                unique: false
                            });
                            break;
                        case STORES.SERVICES:
                            objectStore.createIndex('locationId', 'locationId', {
                                unique: false
                            });
                            objectStore.createIndex('companyId', 'companyId', {
                                unique: false
                            });
                            objectStore.createIndex('status', 'status', {
                                unique: false
                            });
                            break;
                        case STORES.APPOINTMENTS:
                            objectStore.createIndex('locationId', 'locationId', {
                                unique: false
                            });
                            objectStore.createIndex('companyId', 'companyId', {
                                unique: false
                            });
                            objectStore.createIndex('customerId', 'customerId', {
                                unique: false
                            });
                            objectStore.createIndex('staffId', 'staffId', {
                                unique: false
                            });
                            objectStore.createIndex('serviceId', 'serviceId', {
                                unique: false
                            });
                            objectStore.createIndex('roomId', 'roomId', {
                                unique: false
                            });
                            objectStore.createIndex('date', 'date', {
                                unique: false
                            });
                            objectStore.createIndex('status', 'status', {
                                unique: false
                            });
                            objectStore.createIndex('startTime', 'startTime', {
                                unique: false
                            });
                            break;
                        case STORES.NOTIFICATIONS:
                            objectStore.createIndex('createdAt', 'createdAt', {
                                unique: false
                            });
                            objectStore.createIndex('read', 'read', {
                                unique: false
                            });
                            break;
                    }
                }
            });
        };
    });
}
/**
 * Generic IndexedDB operations
 */ class IndexedDBStorage {
    dbPromise = null;
    constructor(){
        // Only initialize in browser environment
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    async getDb() {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error('IndexedDB is only available in the browser');
        }
        if (!this.dbPromise) {
            this.dbPromise = initDatabase();
        }
        return this.dbPromise;
    }
    /**
   * Get all items from a store
   */ async getAll(storeName) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = ()=>{
                resolve(request.result);
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to get all items from ${storeName}`));
            };
        });
    }
    /**
   * Get a single item by ID
   */ async getById(storeName, id) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = ()=>{
                resolve(request.result);
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to get item from ${storeName}`));
            };
        });
    }
    /**
   * Get items by index
   */ async getByIndex(storeName, indexName, indexValue) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(indexValue);
            request.onsuccess = ()=>{
                resolve(request.result);
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to get items by index from ${storeName}`));
            };
        });
    }
    /**
   * Add or update an item
   */ async put(storeName, item) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            request.onsuccess = ()=>{
                resolve(item);
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to put item in ${storeName}`));
            };
        });
    }
    /**
   * Add multiple items
   */ async putMany(storeName, items) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const promises = items.map((item)=>{
                return new Promise((itemResolve, itemReject)=>{
                    const request = store.put(item);
                    request.onsuccess = ()=>itemResolve();
                    request.onerror = ()=>itemReject(new Error('Failed to put item'));
                });
            });
            Promise.all(promises).then(()=>resolve(items)).catch(()=>reject(new Error(`Failed to put items in ${storeName}`)));
        });
    }
    /**
   * Delete an item by ID
   */ async delete(storeName, id) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = ()=>{
                resolve();
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to delete item from ${storeName}`));
            };
        });
    }
    /**
   * Clear all items from a store
   */ async clear(storeName) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = ()=>{
                resolve();
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to clear ${storeName}`));
            };
        });
    }
    /**
   * Count items in a store
   */ async count(storeName) {
        const db = await this.getDb();
        return new Promise((resolve, reject)=>{
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            request.onsuccess = ()=>{
                resolve(request.result);
            };
            request.onerror = ()=>{
                reject(new Error(`Failed to count items in ${storeName}`));
            };
        });
    }
    /**
   * Clear all data from database
   */ async clearAll() {
        const stores = Object.values(STORES);
        await Promise.all(stores.map((store)=>this.clear(store)));
    }
    /**
   * Check if database has been initialized with seed data
   */ async isInitialized() {
        try {
            const companiesCount = await this.count(STORES.COMPANIES);
            return companiesCount > 0;
        } catch  {
            return false;
        }
    }
    /**
   * Advanced query with filtering
   */ async query(storeName, predicate) {
        const all = await this.getAll(storeName);
        return all.filter(predicate);
    }
}
const db = new IndexedDBStorage();
function isIndexedDBSupported() {
    return typeof indexedDB !== 'undefined';
}
async function debugDatabase() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
async function loadSeedData() {
    try {
        const { seedData } = await __turbopack_context__.A("[project]/lib/storage/seed-data.ts [app-ssr] (ecmascript, async loader)");
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
async function initializeWithSeedData() {
    const isInitialized = await db.isInitialized();
    if (!isInitialized) {
        console.log('🌱 Database empty, loading seed data...');
        await loadSeedData();
    } else {
        console.log('✅ Database already initialized');
    }
}
async function resetDatabase() {
    await db.clearAll();
    console.log('🗑️ Database cleared');
    await loadSeedData();
    console.log('🌱 Database reset with fresh seed data');
}
// Expose debug functions globally in development
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Base Repository
 * 
 * Provides common CRUD operations for all repositories.
 * This abstraction makes it easy to swap from IndexedDB to API calls later.
 */ __turbopack_context__.s([
    "BaseRepository",
    ()=>BaseRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
;
class BaseRepository {
    storeName;
    constructor(storeName){
        this.storeName = storeName;
    }
    /**
   * Get all items (optionally filtered)
   */ async getAll(filter) {
        try {
            let items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].getAll(this.storeName);
            // Apply filters
            if (filter?.status) {
                items = items.filter((item)=>item.status === filter.status);
            }
            if (filter?.search) {
                items = this.applySearchFilter(items, filter.search);
            }
            // Apply sorting
            if (filter?.sortBy) {
                items = this.applySorting(items, filter.sortBy, filter.sortOrder || 'asc');
            }
            return {
                success: true,
                data: items
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch ${this.storeName}: ${error}`
            };
        }
    }
    /**
   * Get paginated items
   */ async getPaginated(filter = {}) {
        try {
            const allResponse = await this.getAll(filter);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const items = allResponse.data;
            const page = filter.page || 1;
            const pageSize = filter.pageSize || 10;
            const total = items.length;
            const totalPages = Math.ceil(total / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            return {
                success: true,
                data: {
                    data: items.slice(startIndex, endIndex),
                    total,
                    page,
                    pageSize,
                    totalPages
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch paginated ${this.storeName}: ${error}`
            };
        }
    }
    /**
   * Get item by ID
   */ async getById(id) {
        try {
            const item = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].getById(this.storeName, id);
            if (!item) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }
            return {
                success: true,
                data: item
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch item: ${error}`
            };
        }
    }
    /**
   * Create new item
   */ async create(data) {
        try {
            const now = new Date().toISOString();
            const id = this.generateId();
            const item = {
                ...data,
                id,
                createdAt: now,
                updatedAt: now
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].put(this.storeName, item);
            return {
                success: true,
                data: item
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to create item: ${error}`
            };
        }
    }
    /**
   * Update existing item
   */ async update(id, data) {
        try {
            const existingResponse = await this.getById(id);
            if (!existingResponse.success || !existingResponse.data) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }
            const updated = {
                ...existingResponse.data,
                ...data,
                id,
                updatedAt: new Date().toISOString()
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].put(this.storeName, updated);
            return {
                success: true,
                data: updated
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to update item: ${error}`
            };
        }
    }
    /**
   * Delete item (hard delete)
   */ async delete(id) {
        try {
            const existingResponse = await this.getById(id);
            if (!existingResponse.success) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].delete(this.storeName, id);
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to delete item: ${error}`
            };
        }
    }
    /**
   * Archive item (soft delete)
   */ async archive(id) {
        return this.update(id, {
            status: 'archived'
        });
    }
    /**
   * Restore archived item
   */ async restore(id) {
        return this.update(id, {
            status: 'active'
        });
    }
    /**
   * Count items
   */ async count(filter) {
        try {
            const allResponse = await this.getAll(filter);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            return {
                success: true,
                data: allResponse.data.length
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to count items: ${error}`
            };
        }
    }
    /**
   * Get items by index
   */ async getByIndex(indexName, indexValue) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"].getByIndex(this.storeName, indexName, indexValue);
    }
    /**
   * Generate unique ID
   */ generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
   * Apply sorting
   */ applySorting(items, sortBy, sortOrder) {
        return [
            ...items
        ].sort((a, b)=>{
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            const order = sortOrder === 'asc' ? 1 : -1;
            if (aValue < bValue) return -1 * order;
            if (aValue > bValue) return 1 * order;
            return 0;
        });
    }
}
}),
"[project]/lib/repositories/company.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Company Repository
 */ __turbopack_context__.s([
    "companyRepository",
    ()=>companyRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class CompanyRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].COMPANIES);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.email?.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower));
    }
    /**
   * Get companies by plan
   */ async getByPlan(plan) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const filtered = allResponse.data.filter((c)=>c.plan === plan);
            return {
                success: true,
                data: filtered
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by plan: ${error}`
            };
        }
    }
    /**
   * Update location count for a company
   */ async updateLocationCount(companyId, count) {
        const companyResponse = await this.getById(companyId);
        if (!companyResponse.success || !companyResponse.data) {
            return {
                success: false,
                error: 'Company not found'
            };
        }
        const company = companyResponse.data;
        // Note: locationIds should be managed by the service layer
        return this.update(companyId, company);
    }
}
const companyRepository = new CompanyRepository();
}),
"[project]/lib/repositories/location.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Location Repository
 */ __turbopack_context__.s([
    "locationRepository",
    ()=>locationRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class LocationRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].LOCATIONS);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.address.toLowerCase().includes(searchLower) || item.city?.toLowerCase().includes(searchLower) || item.manager?.toLowerCase().includes(searchLower) || item.email?.toLowerCase().includes(searchLower));
    }
    /**
   * Get locations by company ID
   */ async getByCompanyId(companyId) {
        try {
            const locations = await this.getByIndex('companyId', companyId);
            return {
                success: true,
                data: locations
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get locations by status
   */ async getByStatus(status) {
        try {
            const locations = await this.getByIndex('status', status);
            return {
                success: true,
                data: locations
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by status: ${error}`
            };
        }
    }
    /**
   * Update customer count for a location
   */ async updateCustomerCount(locationId, count) {
        return this.update(locationId, {
            customerCount: count
        });
    }
    /**
   * Update staff count for a location
   */ async updateStaffCount(locationId, count) {
        return this.update(locationId, {
            staffCount: count
        });
    }
}
const locationRepository = new LocationRepository();
}),
"[project]/lib/repositories/customer.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Customer Repository
 */ __turbopack_context__.s([
    "customerRepository",
    ()=>customerRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class CustomerRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].CUSTOMERS);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.email.toLowerCase().includes(searchLower) || item.phone.toLowerCase().includes(searchLower) || item.notes?.toLowerCase().includes(searchLower));
    }
    /**
   * Get customers by location ID
   */ async getByLocationId(locationId) {
        try {
            const customers = await this.getByIndex('locationId', locationId);
            return {
                success: true,
                data: customers
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by location: ${error}`
            };
        }
    }
    /**
   * Get customers by company ID
   */ async getByCompanyId(companyId) {
        try {
            const customers = await this.getByIndex('companyId', companyId);
            return {
                success: true,
                data: customers
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get customer by email
   */ async getByEmail(email) {
        try {
            const customers = await this.getByIndex('email', email);
            const customer = customers[0];
            if (!customer) {
                return {
                    success: false,
                    error: 'Customer not found'
                };
            }
            return {
                success: true,
                data: customer
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by email: ${error}`
            };
        }
    }
    /**
   * Get customers with advanced filtering
   */ async getFiltered(filter) {
        try {
            const allResponse = await this.getAll(filter);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            let customers = allResponse.data;
            // Apply location filter
            if (filter.locationId) {
                customers = customers.filter((c)=>c.locationId === filter.locationId);
            }
            // Apply membership tier filter
            if (filter.membershipTier) {
                customers = customers.filter((c)=>c.membershipTier === filter.membershipTier);
            }
            // Apply date filters
            if (filter.dateFrom) {
                customers = customers.filter((c)=>c.memberSince >= filter.dateFrom);
            }
            if (filter.dateTo) {
                customers = customers.filter((c)=>c.memberSince <= filter.dateTo);
            }
            return {
                success: true,
                data: customers
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to filter customers: ${error}`
            };
        }
    }
    /**
   * Get customers by membership tier
   */ async getByMembershipTier(tier) {
        try {
            const customers = await this.getByIndex('membershipTier', tier);
            return {
                success: true,
                data: customers
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by membership tier: ${error}`
            };
        }
    }
    /**
   * Update customer visit count
   */ async updateVisitCount(customerId, visits, lastVisit) {
        const updateData = {
            visits
        };
        if (lastVisit) {
            updateData.lastVisit = lastVisit;
        }
        return this.update(customerId, updateData);
    }
    /**
   * Update customer balance
   */ async updateBalance(customerId, balance) {
        return this.update(customerId, {
            balance
        });
    }
    /**
   * Check if email exists (for validation)
   */ async emailExists(email, excludeId) {
        try {
            const customers = await this.getByIndex('email', email);
            if (excludeId) {
                return customers.some((c)=>c.id !== excludeId);
            }
            return customers.length > 0;
        } catch  {
            return false;
        }
    }
}
const customerRepository = new CustomerRepository();
}),
"[project]/lib/repositories/staff.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Staff Repository
 */ __turbopack_context__.s([
    "staffRepository",
    ()=>staffRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class StaffRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].STAFF);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.email.toLowerCase().includes(searchLower) || item.phone.toLowerCase().includes(searchLower) || item.role.toLowerCase().includes(searchLower) || item.specializations?.some((spec)=>spec.toLowerCase().includes(searchLower)));
    }
    /**
   * Get staff by location ID
   */ async getByLocationId(locationId) {
        try {
            const staff = await this.getByIndex('locationId', locationId);
            return {
                success: true,
                data: staff
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by location: ${error}`
            };
        }
    }
    /**
   * Get staff by company ID
   */ async getByCompanyId(companyId) {
        try {
            const staff = await this.getByIndex('companyId', companyId);
            return {
                success: true,
                data: staff
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get staff by email
   */ async getByEmail(email) {
        try {
            const staff = await this.getByIndex('email', email);
            const member = staff[0];
            if (!member) {
                return {
                    success: false,
                    error: 'Staff member not found'
                };
            }
            return {
                success: true,
                data: member
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by email: ${error}`
            };
        }
    }
    /**
   * Get staff with advanced filtering
   */ async getFiltered(filter) {
        try {
            const allResponse = await this.getAll(filter);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            let staff = allResponse.data;
            // Apply location filter
            if (filter.locationId) {
                staff = staff.filter((s)=>s.locationId === filter.locationId);
            }
            // Apply role filter
            if (filter.role) {
                staff = staff.filter((s)=>s.role.toLowerCase().includes(filter.role.toLowerCase()));
            }
            return {
                success: true,
                data: staff
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to filter staff: ${error}`
            };
        }
    }
    /**
   * Get staff assigned to a specific room
   */ async getByRoomAssignment(roomId) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const staff = allResponse.data.filter((s)=>s.roomAssignments?.includes(roomId));
            return {
                success: true,
                data: staff
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by room assignment: ${error}`
            };
        }
    }
    /**
   * Get staff by role
   */ async getByRole(role) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const staff = allResponse.data.filter((s)=>s.role.toLowerCase() === role.toLowerCase());
            return {
                success: true,
                data: staff
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by role: ${error}`
            };
        }
    }
    /**
   * Check if email exists (for validation)
   */ async emailExists(email, excludeId) {
        try {
            const staff = await this.getByIndex('email', email);
            if (excludeId) {
                return staff.some((s)=>s.id !== excludeId);
            }
            return staff.length > 0;
        } catch  {
            return false;
        }
    }
    /**
   * Update room assignments
   */ async updateRoomAssignments(staffId, roomIds) {
        return this.update(staffId, {
            roomAssignments: roomIds
        });
    }
}
const staffRepository = new StaffRepository();
}),
"[project]/lib/repositories/room.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Room Repository
 */ __turbopack_context__.s([
    "roomRepository",
    ()=>roomRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class RoomRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].ROOMS);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.type.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower) || item.floor?.toLowerCase().includes(searchLower) || item.amenities?.some((amenity)=>amenity.toLowerCase().includes(searchLower)));
    }
    /**
   * Get rooms by location ID
   */ async getByLocationId(locationId) {
        try {
            const rooms = await this.getByIndex('locationId', locationId);
            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by location: ${error}`
            };
        }
    }
    /**
   * Get rooms by company ID
   */ async getByCompanyId(companyId) {
        try {
            const rooms = await this.getByIndex('companyId', companyId);
            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get rooms by status
   */ async getByStatus(status) {
        try {
            const rooms = await this.getByIndex('status', status);
            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by status: ${error}`
            };
        }
    }
    /**
   * Get rooms by type
   */ async getByType(type) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const rooms = allResponse.data.filter((r)=>r.type === type);
            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by type: ${error}`
            };
        }
    }
    /**
   * Get available rooms for a location
   */ async getAvailableByLocationId(locationId) {
        try {
            const allResponse = await this.getByLocationId(locationId);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const availableRooms = allResponse.data.filter((r)=>r.status === 'active');
            return {
                success: true,
                data: availableRooms
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch available rooms: ${error}`
            };
        }
    }
    /**
   * Get rooms with specific amenities
   */ async getByAmenities(amenities) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const rooms = allResponse.data.filter((room)=>amenities.every((amenity)=>room.amenities?.includes(amenity)));
            return {
                success: true,
                data: rooms
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by amenities: ${error}`
            };
        }
    }
}
const roomRepository = new RoomRepository();
}),
"[project]/lib/repositories/service.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Service Repository
 */ __turbopack_context__.s([
    "serviceRepository",
    ()=>serviceRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class ServiceRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SERVICES);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower) || item.category?.toLowerCase().includes(searchLower) || item.requirements?.some((req)=>req.toLowerCase().includes(searchLower)));
    }
    /**
   * Get services by location ID
   */ async getByLocationId(locationId) {
        try {
            const services = await this.getByIndex('locationId', locationId);
            return {
                success: true,
                data: services
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by location: ${error}`
            };
        }
    }
    /**
   * Get services by company ID
   */ async getByCompanyId(companyId) {
        try {
            const services = await this.getByIndex('companyId', companyId);
            return {
                success: true,
                data: services
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get services by status
   */ async getByStatus(status) {
        try {
            const services = await this.getByIndex('status', status);
            return {
                success: true,
                data: services
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by status: ${error}`
            };
        }
    }
    /**
   * Get services by category
   */ async getByCategory(category) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const services = allResponse.data.filter((s)=>s.category?.toLowerCase() === category.toLowerCase());
            return {
                success: true,
                data: services
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by category: ${error}`
            };
        }
    }
    /**
   * Get services by room ID
   */ async getByRoomId(roomId) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const services = allResponse.data.filter((s)=>s.roomId === roomId);
            return {
                success: true,
                data: services
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by room: ${error}`
            };
        }
    }
    /**
   * Get services by duration range
   */ async getByDurationRange(minDuration, maxDuration) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const services = allResponse.data.filter((s)=>s.duration >= minDuration && s.duration <= maxDuration);
            return {
                success: true,
                data: services
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by duration: ${error}`
            };
        }
    }
    /**
   * Get available services for a location
   */ async getAvailableByLocationId(locationId) {
        try {
            const allResponse = await this.getByLocationId(locationId);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const availableServices = allResponse.data.filter((s)=>s.status === 'active');
            return {
                success: true,
                data: availableServices
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch available services: ${error}`
            };
        }
    }
}
const serviceRepository = new ServiceRepository();
}),
"[project]/lib/repositories/appointment.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Appointment Repository
 */ __turbopack_context__.s([
    "appointmentRepository",
    ()=>appointmentRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class AppointmentRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].APPOINTMENTS);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.notes?.toLowerCase().includes(searchLower) || item.customerNotes?.toLowerCase().includes(searchLower) || item.internalNotes?.toLowerCase().includes(searchLower) || item.cancellationNotes?.toLowerCase().includes(searchLower));
    }
    /**
   * Get appointments by location ID
   */ async getByLocationId(locationId) {
        try {
            const appointments = await this.getByIndex('locationId', locationId);
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by location: ${error}`
            };
        }
    }
    /**
   * Get appointments by company ID
   */ async getByCompanyId(companyId) {
        try {
            const appointments = await this.getByIndex('companyId', companyId);
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get appointments by customer ID
   */ async getByCustomerId(customerId) {
        try {
            const appointments = await this.getByIndex('customerId', customerId);
            // Sort by date descending (most recent first)
            appointments.sort((a, b)=>new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by customer: ${error}`
            };
        }
    }
    /**
   * Get appointments by staff ID
   */ async getByStaffId(staffId) {
        try {
            const appointments = await this.getByIndex('staffId', staffId);
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by staff: ${error}`
            };
        }
    }
    /**
   * Get appointments by service ID
   */ async getByServiceId(serviceId) {
        try {
            const appointments = await this.getByIndex('serviceId', serviceId);
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by service: ${error}`
            };
        }
    }
    /**
   * Get appointments by room ID
   */ async getByRoomId(roomId) {
        try {
            const appointments = await this.getByIndex('roomId', roomId);
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by room: ${error}`
            };
        }
    }
    /**
   * Get appointments by date
   */ async getByDate(date) {
        try {
            const appointments = await this.getByIndex('date', date);
            // Sort by start time
            appointments.sort((a, b)=>new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by date: ${error}`
            };
        }
    }
    /**
   * Get appointments by status
   */ async getByStatus(status) {
        try {
            const appointments = await this.getByIndex('status', status);
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by status: ${error}`
            };
        }
    }
    /**
   * Get appointments with advanced filtering
   */ async getFiltered(filter) {
        try {
            const allResponse = await this.getAll(filter);
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            let appointments = allResponse.data;
            // Apply location filter
            if (filter.locationId) {
                appointments = appointments.filter((a)=>a.locationId === filter.locationId);
            }
            // Apply customer filter
            if (filter.customerId) {
                appointments = appointments.filter((a)=>a.customerId === filter.customerId);
            }
            // Apply staff filter
            if (filter.staffId) {
                appointments = appointments.filter((a)=>a.staffId === filter.staffId);
            }
            // Apply service filter
            if (filter.serviceId) {
                appointments = appointments.filter((a)=>a.serviceId === filter.serviceId);
            }
            // Apply room filter
            if (filter.roomId) {
                appointments = appointments.filter((a)=>a.roomId === filter.roomId);
            }
            // Apply status filter
            if (filter.status) {
                appointments = appointments.filter((a)=>a.status === filter.status);
            }
            // Apply date filter
            if (filter.date) {
                appointments = appointments.filter((a)=>a.date === filter.date);
            }
            // Apply date range filters
            if (filter.dateFrom) {
                appointments = appointments.filter((a)=>a.date >= filter.dateFrom);
            }
            if (filter.dateTo) {
                appointments = appointments.filter((a)=>a.date <= filter.dateTo);
            }
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to filter appointments: ${error}`
            };
        }
    }
    /**
   * Get appointments by date range
   */ async getByDateRange(startDate, endDate) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const appointments = allResponse.data.filter((a)=>a.date >= startDate && a.date <= endDate);
            // Sort by date and time
            appointments.sort((a, b)=>{
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare === 0) {
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                }
                return dateCompare;
            });
            return {
                success: true,
                data: appointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by date range: ${error}`
            };
        }
    }
    /**
   * Check for appointment conflicts
   */ async checkConflicts(staffId, roomId, startTime, endTime, excludeId) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const conflicts = allResponse.data.filter((appointment)=>{
                // Exclude the current appointment if updating
                if (excludeId && appointment.id === excludeId) {
                    return false;
                }
                // Only check scheduled and checked-in appointments
                if (![
                    'scheduled',
                    'checked-in'
                ].includes(appointment.status)) {
                    return false;
                }
                // Check staff or room conflict
                const staffConflict = appointment.staffId === staffId;
                const roomConflict = appointment.roomId === roomId;
                if (!staffConflict && !roomConflict) {
                    return false;
                }
                // Check time overlap
                const appointmentStart = new Date(appointment.startTime).getTime();
                const appointmentEnd = new Date(appointment.endTime).getTime();
                const newStart = new Date(startTime).getTime();
                const newEnd = new Date(endTime).getTime();
                // Times overlap if: start time is before their end time AND end time is after their start time
                return newStart < appointmentEnd && newEnd > appointmentStart;
            });
            return {
                success: true,
                data: conflicts
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to check conflicts: ${error}`
            };
        }
    }
    /**
   * Get today's appointments by location
   */ async getTodaysByLocation(locationId) {
        const today = new Date().toISOString().split('T')[0];
        try {
            const todaysResponse = await this.getByDate(today);
            if (!todaysResponse.success || !todaysResponse.data) {
                return {
                    success: false,
                    error: todaysResponse.error
                };
            }
            const locationAppointments = todaysResponse.data.filter((a)=>a.locationId === locationId);
            return {
                success: true,
                data: locationAppointments
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch today's appointments: ${error}`
            };
        }
    }
    /**
   * Get upcoming appointments for a customer
   */ async getUpcomingByCustomer(customerId, limit = 10) {
        try {
            const customerResponse = await this.getByCustomerId(customerId);
            if (!customerResponse.success || !customerResponse.data) {
                return {
                    success: false,
                    error: customerResponse.error
                };
            }
            const now = new Date();
            const upcoming = customerResponse.data.filter((a)=>new Date(a.startTime) > now && a.status === 'scheduled').sort((a, b)=>new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, limit);
            return {
                success: true,
                data: upcoming
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch upcoming appointments: ${error}`
            };
        }
    }
}
const appointmentRepository = new AppointmentRepository();
}),
"[project]/lib/repositories/user.repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * User Repository
 */ __turbopack_context__.s([
    "userRepository",
    ()=>userRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
;
class UserRepository extends __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseRepository"] {
    constructor(){
        super(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].USERS);
    }
    applySearchFilter(items, search) {
        const searchLower = search.toLowerCase();
        return items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.email.toLowerCase().includes(searchLower) || item.phone?.toLowerCase().includes(searchLower) || item.role.toLowerCase().includes(searchLower));
    }
    /**
   * Get user by email (for authentication)
   */ async getByEmail(email) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const user = allResponse.data.find((u)=>u.email === email);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            return {
                success: true,
                data: user
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by email: ${error}`
            };
        }
    }
    /**
   * Get users by role
   */ async getByRole(role) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const users = allResponse.data.filter((u)=>u.role === role);
            return {
                success: true,
                data: users
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by role: ${error}`
            };
        }
    }
    /**
   * Get users by company ID
   */ async getByCompanyId(companyId) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const users = allResponse.data.filter((u)=>u.companyId === companyId);
            return {
                success: true,
                data: users
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by company: ${error}`
            };
        }
    }
    /**
   * Get users by location ID
   */ async getByLocationId(locationId) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return {
                    success: false,
                    error: allResponse.error
                };
            }
            const users = allResponse.data.filter((u)=>u.locationId === locationId);
            return {
                success: true,
                data: users
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to fetch by location: ${error}`
            };
        }
    }
    /**
   * Check if email exists (for validation)
   */ async emailExists(email, excludeId) {
        try {
            const allResponse = await this.getAll();
            if (!allResponse.success || !allResponse.data) {
                return false;
            }
            const users = allResponse.data.filter((u)=>u.email === email);
            if (excludeId) {
                return users.some((u)=>u.id !== excludeId);
            }
            return users.length > 0;
        } catch  {
            return false;
        }
    }
}
const userRepository = new UserRepository();
}),
"[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Repository Layer Exports
 * 
 * Centralized exports for all repositories
 * Uses lazy initialization to prevent server-side instantiation issues
 */ __turbopack_context__.s([
    "getAppointmentRepository",
    ()=>getAppointmentRepository,
    "getCompanyRepository",
    ()=>getCompanyRepository,
    "getCustomerRepository",
    ()=>getCustomerRepository,
    "getLocationRepository",
    ()=>getLocationRepository,
    "getRoomRepository",
    ()=>getRoomRepository,
    "getServiceRepository",
    ()=>getServiceRepository,
    "getStaffRepository",
    ()=>getStaffRepository,
    "getUserRepository",
    ()=>getUserRepository,
    "repositories",
    ()=>repositories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$base$2e$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/repositories/base.repository.ts [app-ssr] (ecmascript)");
;
// Lazy getters to avoid instantiating repositories on module load
let _companyRepository;
let _locationRepository;
let _customerRepository;
let _staffRepository;
let _roomRepository;
let _serviceRepository;
let _appointmentRepository;
let _userRepository;
const getCompanyRepository = ()=>{
    if (!_companyRepository) {
        const { companyRepository } = __turbopack_context__.r("[project]/lib/repositories/company.repository.ts [app-ssr] (ecmascript)");
        _companyRepository = companyRepository;
    }
    return _companyRepository;
};
const getLocationRepository = ()=>{
    if (!_locationRepository) {
        const { locationRepository } = __turbopack_context__.r("[project]/lib/repositories/location.repository.ts [app-ssr] (ecmascript)");
        _locationRepository = locationRepository;
    }
    return _locationRepository;
};
const getCustomerRepository = ()=>{
    if (!_customerRepository) {
        const { customerRepository } = __turbopack_context__.r("[project]/lib/repositories/customer.repository.ts [app-ssr] (ecmascript)");
        _customerRepository = customerRepository;
    }
    return _customerRepository;
};
const getStaffRepository = ()=>{
    if (!_staffRepository) {
        const { staffRepository } = __turbopack_context__.r("[project]/lib/repositories/staff.repository.ts [app-ssr] (ecmascript)");
        _staffRepository = staffRepository;
    }
    return _staffRepository;
};
const getRoomRepository = ()=>{
    if (!_roomRepository) {
        const { roomRepository } = __turbopack_context__.r("[project]/lib/repositories/room.repository.ts [app-ssr] (ecmascript)");
        _roomRepository = roomRepository;
    }
    return _roomRepository;
};
const getServiceRepository = ()=>{
    if (!_serviceRepository) {
        const { serviceRepository } = __turbopack_context__.r("[project]/lib/repositories/service.repository.ts [app-ssr] (ecmascript)");
        _serviceRepository = serviceRepository;
    }
    return _serviceRepository;
};
const getAppointmentRepository = ()=>{
    if (!_appointmentRepository) {
        const { appointmentRepository } = __turbopack_context__.r("[project]/lib/repositories/appointment.repository.ts [app-ssr] (ecmascript)");
        _appointmentRepository = appointmentRepository;
    }
    return _appointmentRepository;
};
const getUserRepository = ()=>{
    if (!_userRepository) {
        const { userRepository } = __turbopack_context__.r("[project]/lib/repositories/user.repository.ts [app-ssr] (ecmascript)");
        _userRepository = userRepository;
    }
    return _userRepository;
};
const repositories = {
    get company () {
        return getCompanyRepository();
    },
    get location () {
        return getLocationRepository();
    },
    get customer () {
        return getCustomerRepository();
    },
    get staff () {
        return getStaffRepository();
    },
    get room () {
        return getRoomRepository();
    },
    get service () {
        return getServiceRepository();
    },
    get appointment () {
        return getAppointmentRepository();
    },
    get user () {
        return getUserRepository();
    }
};
}),
"[project]/types/entities.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Core Entity Types for Hospitality Management System
 * 
 * This system is a multi-tenant, multi-location membership/service operations application
 * NOT a traditional hotel PMS - it manages appointments, services, and customer relationships
 */ // ============================================================================
// ENUMS & STATUS TYPES
// ============================================================================
__turbopack_context__.s([
    "VALID_STATUS_TRANSITIONS",
    ()=>VALID_STATUS_TRANSITIONS,
    "getUserScope",
    ()=>getUserScope,
    "isValidStatusTransition",
    ()=>isValidStatusTransition
]);
const VALID_STATUS_TRANSITIONS = {
    'scheduled': [
        'checked-in',
        'cancelled',
        'no-show'
    ],
    'checked-in': [
        'completed',
        'cancelled'
    ],
    'completed': [],
    'cancelled': [
        'scheduled'
    ],
    'no-show': [
        'scheduled'
    ]
};
function isValidStatusTransition(from, to) {
    return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
function getUserScope(user) {
    switch(user.role){
        case 'reseller-admin':
            return {
                role: user.role
            }; // Can see everything
        case 'company-admin':
            return {
                role: user.role,
                companyIds: user.companyId ? [
                    user.companyId
                ] : []
            };
        case 'location-staff':
        case 'viewer':
            return {
                role: user.role,
                companyIds: user.companyId ? [
                    user.companyId
                ] : [],
                locationIds: user.locationId ? [
                    user.locationId
                ] : []
            };
        default:
            return {
                role: user.role,
                companyIds: [],
                locationIds: []
            };
    }
}
}),
"[project]/lib/hooks/useAuth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Authentication Hooks
 * 
 * Hooks for managing user authentication and authorization
 */ __turbopack_context__.s([
    "AuthContext",
    ()=>AuthContext,
    "useAuth",
    ()=>useAuth,
    "useAuthProvider",
    ()=>useAuthProvider,
    "usePermissions",
    ()=>usePermissions,
    "useScopedData",
    ()=>useScopedData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/entities.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
function useAuthProvider() {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        user: null,
        loading: true,
        error: null
    });
    // Initialize auth state from localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initializeAuth = async ()=>{
            try {
                const savedUser = localStorage.getItem('hospitality-admin-user');
                if (savedUser) {
                    const user = JSON.parse(savedUser);
                    // Verify user still exists in database
                    const userRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUserRepository"])();
                    const userResponse = await userRepository.getById(user.id);
                    if (userResponse.success && userResponse.data) {
                        setState({
                            user: userResponse.data,
                            loading: false,
                            error: null
                        });
                    } else {
                        localStorage.removeItem('hospitality-admin-user');
                        setState({
                            user: null,
                            loading: false,
                            error: null
                        });
                    }
                } else {
                    setState((prev)=>({
                            ...prev,
                            loading: false
                        }));
                }
            } catch (error) {
                setState({
                    user: null,
                    loading: false,
                    error: 'Failed to initialize authentication'
                });
            }
        };
        initializeAuth();
    }, []);
    const login = async (email, password)=>{
        setState((prev)=>({
                ...prev,
                loading: true,
                error: null
            }));
        try {
            // In a real app, this would verify credentials against an API
            // For now, we'll just check if the user exists
            const userRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUserRepository"])();
            const userResponse = await userRepository.getByEmail(email);
            if (userResponse.success && userResponse.data) {
                const user = userResponse.data;
                // Store user in localStorage
                localStorage.setItem('hospitality-admin-user', JSON.stringify(user));
                setState({
                    user,
                    loading: false,
                    error: null
                });
                return true;
            } else {
                setState((prev)=>({
                        ...prev,
                        loading: false,
                        error: 'Invalid email or password'
                    }));
                return false;
            }
        } catch (error) {
            setState((prev)=>({
                    ...prev,
                    loading: false,
                    error: 'Login failed. Please try again.'
                }));
            return false;
        }
    };
    const logout = ()=>{
        localStorage.removeItem('hospitality-admin-user');
        setState({
            user: null,
            loading: false,
            error: null
        });
    };
    const setCurrentUser = (user)=>{
        localStorage.setItem('hospitality-admin-user', JSON.stringify(user));
        setState((prev)=>({
                ...prev,
                user
            }));
    };
    const getScope = ()=>{
        if (!state.user) {
            return {
                role: 'viewer',
                companyIds: [],
                locationIds: []
            };
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserScope"])(state.user);
    };
    const hasPermission = (permission)=>{
        if (!state.user) return false;
        const permissions = getRolePermissions(state.user.role);
        return permissions.includes(permission) || permissions.includes('*');
    };
    const canAccessLocation = (locationId)=>{
        if (!state.user) return false;
        const scope = getScope();
        // Reseller admin can access everything
        if (scope.role === 'reseller-admin') return true;
        // Location staff can only access their own location
        if (scope.locationIds?.includes(locationId)) return true;
        return false;
    };
    const canAccessCompany = (companyId)=>{
        if (!state.user) return false;
        const scope = getScope();
        // Reseller admin can access everything
        if (scope.role === 'reseller-admin') return true;
        // Company admin and location staff can access their company
        if (scope.companyIds?.includes(companyId)) return true;
        return false;
    };
    return {
        ...state,
        login,
        logout,
        setCurrentUser,
        getScope,
        hasPermission,
        canAccessLocation,
        canAccessCompany
    };
}
/**
 * Get permissions for a user role
 */ function getRolePermissions(role) {
    switch(role){
        case 'reseller-admin':
            return [
                '*'
            ]; // All permissions
        case 'company-admin':
            return [
                'company.read',
                'company.update',
                'location.create',
                'location.read',
                'location.update',
                'location.delete',
                'customer.create',
                'customer.read',
                'customer.update',
                'customer.delete',
                'staff.create',
                'staff.read',
                'staff.update',
                'staff.delete',
                'appointment.create',
                'appointment.read',
                'appointment.update',
                'appointment.cancel',
                'room.create',
                'room.read',
                'room.update',
                'room.delete',
                'service.create',
                'service.read',
                'service.update',
                'service.delete'
            ];
        case 'location-staff':
            return [
                'customer.create',
                'customer.read',
                'customer.update',
                'appointment.create',
                'appointment.read',
                'appointment.update',
                'appointment.cancel',
                'appointment.checkin',
                'appointment.complete',
                'staff.read',
                'room.read',
                'service.read'
            ];
        case 'viewer':
            return [
                'company.read',
                'location.read',
                'customer.read',
                'staff.read',
                'appointment.read',
                'room.read',
                'service.read'
            ];
        default:
            return [];
    }
}
function usePermissions() {
    const { hasPermission, canAccessLocation, canAccessCompany, getScope } = useAuth();
    return {
        hasPermission,
        canAccessLocation,
        canAccessCompany,
        getScope,
        can: {
            createCompany: ()=>hasPermission('company.create'),
            updateCompany: ()=>hasPermission('company.update'),
            deleteCompany: ()=>hasPermission('company.delete'),
            createLocation: ()=>hasPermission('location.create'),
            updateLocation: ()=>hasPermission('location.update'),
            deleteLocation: ()=>hasPermission('location.delete'),
            createCustomer: ()=>hasPermission('customer.create'),
            updateCustomer: ()=>hasPermission('customer.update'),
            deleteCustomer: ()=>hasPermission('customer.delete'),
            createStaff: ()=>hasPermission('staff.create'),
            updateStaff: ()=>hasPermission('staff.update'),
            deleteStaff: ()=>hasPermission('staff.delete'),
            createAppointment: ()=>hasPermission('appointment.create'),
            updateAppointment: ()=>hasPermission('appointment.update'),
            cancelAppointment: ()=>hasPermission('appointment.cancel'),
            checkInAppointment: ()=>hasPermission('appointment.checkin'),
            completeAppointment: ()=>hasPermission('appointment.complete'),
            createRoom: ()=>hasPermission('room.create'),
            updateRoom: ()=>hasPermission('room.update'),
            deleteRoom: ()=>hasPermission('room.delete'),
            createService: ()=>hasPermission('service.create'),
            updateService: ()=>hasPermission('service.update'),
            deleteService: ()=>hasPermission('service.delete')
        }
    };
}
function useScopedData() {
    const { getScope } = useAuth();
    const scope = getScope();
    return {
        scope,
        getScopedFilter: (baseFilter = {})=>{
            const filter = {
                ...baseFilter
            };
            if (scope.locationIds?.length) {
                filter.locationId = scope.locationIds[0]; // For single location users
            } else if (scope.companyIds?.length) {
            // For company admins, we might want to include all their locations
            // This would require additional logic to fetch locations by company
            }
            return filter;
        },
        isLocationScoped: ()=>!!scope.locationIds?.length,
        isCompanyScoped: ()=>!!scope.companyIds?.length && !scope.locationIds?.length,
        isResellerAdmin: ()=>scope.role === 'reseller-admin'
    };
}
;
}),
"[project]/lib/services/company.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Company Service
 * 
 * Business logic for company management
 */ __turbopack_context__.s([
    "companyService",
    ()=>companyService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
class CompanyService {
    // Lazy-initialized repository accessors
    get companyRepository() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCompanyRepository"])();
    }
    get locationRepository() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
    }
    /**
   * Get all companies with pagination
   */ async getCompanies(filter) {
        return this.companyRepository.getPaginated(filter);
    }
    /**
   * Get company by ID with location details
   */ async getCompanyById(id) {
        const companyResponse = await this.companyRepository.getById(id);
        if (!companyResponse.success || !companyResponse.data) {
            return {
                success: false,
                error: companyResponse.error
            };
        }
        // Get company locations
        const locationsResponse = await this.locationRepository.getByCompanyId(id);
        return {
            success: true,
            data: {
                ...companyResponse.data,
                locations: locationsResponse.data || []
            }
        };
    }
    /**
   * Create new company
   */ async createCompany(data) {
        // Validate required fields
        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Company name is required'
            };
        }
        // Check for duplicate name
        const existingResponse = await this.companyRepository.getAll();
        if (existingResponse.success && existingResponse.data) {
            const duplicate = existingResponse.data.find((c)=>c.name.toLowerCase() === data.name.toLowerCase());
            if (duplicate) {
                return {
                    success: false,
                    error: 'Company name already exists'
                };
            }
        }
        const company = {
            ...data,
            name: data.name.trim(),
            plan: data.plan,
            status: 'active',
            locationIds: []
        };
        return this.companyRepository.create(company);
    }
    /**
   * Update company
   */ async updateCompany(id, data) {
        // Validate name if provided
        if (data.name !== undefined) {
            if (!data.name.trim()) {
                return {
                    success: false,
                    error: 'Company name is required'
                };
            }
            // Check for duplicate name (excluding current company)
            const existingResponse = await this.companyRepository.getAll();
            if (existingResponse.success && existingResponse.data) {
                const duplicate = existingResponse.data.find((c)=>c.id !== id && c.name.toLowerCase() === data.name.toLowerCase());
                if (duplicate) {
                    return {
                        success: false,
                        error: 'Company name already exists'
                    };
                }
            }
            data.name = data.name.trim();
        }
        return this.companyRepository.update(id, data);
    }
    /**
   * Delete company (with validation)
   */ async deleteCompany(id) {
        // Check if company has locations
        const locationsResponse = await this.locationRepository.getByCompanyId(id);
        if (locationsResponse.success && locationsResponse.data && locationsResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete company with existing locations. Please delete all locations first.'
            };
        }
        return this.companyRepository.delete(id);
    }
    /**
   * Archive company
   */ async archiveCompany(id) {
        return this.companyRepository.archive(id);
    }
    /**
   * Get companies by plan
   */ async getCompaniesByPlan(plan) {
        return this.companyRepository.getByPlan(plan);
    }
    /**
   * Get company statistics
   */ async getCompanyStats(companyId) {
        try {
            // Get locations
            const locationsResponse = await this.locationRepository.getByCompanyId(companyId);
            const locationCount = locationsResponse.data?.length || 0;
            // For detailed stats, we'd need to aggregate from other services
            // This is a simplified version
            return {
                success: true,
                data: {
                    locationCount,
                    customerCount: 0,
                    staffCount: 0,
                    totalAppointments: 0
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get company stats: ${error}`
            };
        }
    }
}
const companyService = new CompanyService();
}),
"[project]/lib/services/location.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Location Service
 * 
 * Business logic for location management
 */ __turbopack_context__.s([
    "locationService",
    ()=>locationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
class LocationService {
    // Lazy-initialized repository accessors
    get locationRepository() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
    }
    get companyRepository() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCompanyRepository"])();
    }
    get customerRepository() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomerRepository"])();
    }
    get staffRepository() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getStaffRepository"])();
    }
    /**
   * Get all locations with pagination
   */ async getLocations(filter) {
        return this.locationRepository.getPaginated(filter);
    }
    /**
   * Get location by ID with statistics
   */ async getLocationById(id) {
        const locationResponse = await this.locationRepository.getById(id);
        if (!locationResponse.success || !locationResponse.data) {
            return {
                success: false,
                error: locationResponse.error
            };
        }
        // Get actual counts
        const customersResponse = await this.customerRepository.getByLocationId(id);
        const staffResponse = await this.staffRepository.getByLocationId(id);
        return {
            success: true,
            data: {
                ...locationResponse.data,
                actualCustomerCount: customersResponse.data?.length || 0,
                actualStaffCount: staffResponse.data?.length || 0
            }
        };
    }
    /**
   * Get locations by company ID
   */ async getLocationsByCompanyId(companyId) {
        return this.locationRepository.getByCompanyId(companyId);
    }
    /**
   * Create new location
   */ async createLocation(data) {
        // Validate required fields
        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Location name is required'
            };
        }
        if (!data.address.trim()) {
            return {
                success: false,
                error: 'Location address is required'
            };
        }
        // Validate company exists
        const companyResponse = await this.companyRepository.getById(data.companyId);
        if (!companyResponse.success || !companyResponse.data) {
            return {
                success: false,
                error: 'Company not found'
            };
        }
        // Check for duplicate name within company
        const existingResponse = await this.locationRepository.getByCompanyId(data.companyId);
        if (existingResponse.success && existingResponse.data) {
            const duplicate = existingResponse.data.find((l)=>l.name.toLowerCase() === data.name.toLowerCase());
            if (duplicate) {
                return {
                    success: false,
                    error: 'Location name already exists in this company'
                };
            }
        }
        const location = {
            ...data,
            name: data.name.trim(),
            address: data.address.trim(),
            status: 'active',
            customerCount: 0,
            staffCount: 0
        };
        const result = await this.locationRepository.create(location);
        // Update company's location IDs if creation was successful
        if (result.success && result.data) {
            const company = companyResponse.data;
            const updatedLocationIds = [
                ...company.locationIds || [],
                result.data.id
            ];
            await this.companyRepository.update(data.companyId, {
                locationIds: updatedLocationIds
            });
        }
        return result;
    }
    /**
   * Update location
   */ async updateLocation(id, data) {
        // Get current location to validate company change
        const currentResponse = await this.locationRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        // Validate name if provided
        if (data.name !== undefined) {
            if (!data.name.trim()) {
                return {
                    success: false,
                    error: 'Location name is required'
                };
            }
            // Check for duplicate name within company (excluding current location)
            const existingResponse = await this.locationRepository.getByCompanyId(currentResponse.data.companyId);
            if (existingResponse.success && existingResponse.data) {
                const duplicate = existingResponse.data.find((l)=>l.id !== id && l.name.toLowerCase() === data.name.toLowerCase());
                if (duplicate) {
                    return {
                        success: false,
                        error: 'Location name already exists in this company'
                    };
                }
            }
            data.name = data.name.trim();
        }
        // Validate address if provided
        if (data.address !== undefined && !data.address.trim()) {
            return {
                success: false,
                error: 'Location address is required'
            };
        }
        if (data.address) {
            data.address = data.address.trim();
        }
        return this.locationRepository.update(id, data);
    }
    /**
   * Delete location (with validation)
   */ async deleteLocation(id) {
        // Get location details
        const locationResponse = await this.locationRepository.getById(id);
        if (!locationResponse.success || !locationResponse.data) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        const location = locationResponse.data;
        // Check if location has customers
        const customersResponse = await this.customerRepository.getByLocationId(id);
        if (customersResponse.success && customersResponse.data && customersResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete location with existing customers. Please transfer or delete all customers first.'
            };
        }
        // Check if location has staff
        const staffResponse = await this.staffRepository.getByLocationId(id);
        if (staffResponse.success && staffResponse.data && staffResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete location with existing staff. Please transfer or delete all staff first.'
            };
        }
        // Delete location
        const deleteResponse = await this.locationRepository.delete(id);
        // Update company's location IDs if deletion was successful
        if (deleteResponse.success) {
            const companyResponse = await this.companyRepository.getById(location.companyId);
            if (companyResponse.success && companyResponse.data) {
                const updatedLocationIds = companyResponse.data.locationIds.filter((locId)=>locId !== id);
                await this.companyRepository.update(location.companyId, {
                    locationIds: updatedLocationIds
                });
            }
        }
        return deleteResponse;
    }
    /**
   * Archive location
   */ async archiveLocation(id) {
        return this.locationRepository.archive(id);
    }
    /**
   * Update location statistics
   */ async updateLocationStats(locationId) {
        // Get actual counts
        const customersResponse = await this.customerRepository.getByLocationId(locationId);
        const staffResponse = await this.staffRepository.getByLocationId(locationId);
        const customerCount = customersResponse.data?.length || 0;
        const staffCount = staffResponse.data?.length || 0;
        return this.locationRepository.update(locationId, {
            customerCount,
            staffCount
        });
    }
    /**
   * Get location statistics
   */ async getLocationStats(locationId) {
        try {
            const customersResponse = await this.customerRepository.getByLocationId(locationId);
            const staffResponse = await this.staffRepository.getByLocationId(locationId);
            const customers = customersResponse.data || [];
            const staff = staffResponse.data || [];
            return {
                success: true,
                data: {
                    customerCount: customers.length,
                    staffCount: staff.length,
                    activeCustomers: customers.filter((c)=>c.status === 'active').length,
                    activeStaff: staff.filter((s)=>s.status === 'active').length,
                    todayAppointments: 0
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get location stats: ${error}`
            };
        }
    }
}
const locationService = new LocationService();
}),
"[project]/lib/services/customer.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Customer Service
 * 
 * Business logic for customer management
 */ __turbopack_context__.s([
    "customerService",
    ()=>customerService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
// Lazy-initialized repository accessors
const customerRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomerRepository"])();
const locationRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
const appointmentRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAppointmentRepository"])();
class CustomerService {
    /**
   * Get all customers with pagination
   */ async getCustomers(filter) {
        return customerRepository.getPaginated(filter);
    }
    /**
   * Get customers with advanced filtering
   */ async getFilteredCustomers(filter) {
        return customerRepository.getFiltered(filter);
    }
    /**
   * Get customer by ID
   */ async getCustomerById(id) {
        return customerRepository.getById(id);
    }
    /**
   * Get customer profile with appointments
   */ async getCustomerProfile(id) {
        const customerResponse = await customerRepository.getById(id);
        if (!customerResponse.success || !customerResponse.data) {
            return {
                success: false,
                error: customerResponse.error
            };
        }
        // Get customer appointments
        const appointmentsResponse = await appointmentRepository.getByCustomerId(id);
        const appointments = appointmentsResponse.data || [];
        // Separate upcoming and historical appointments
        const now = new Date();
        const upcomingAppointments = appointments.filter((a)=>new Date(a.startTime) > now && a.status === 'scheduled').slice(0, 5); // Limit to 5 upcoming
        const appointmentHistory = appointments.filter((a)=>new Date(a.startTime) <= now || [
                'completed',
                'cancelled',
                'no-show'
            ].includes(a.status)).slice(0, 20); // Limit to 20 historical
        const profile = {
            ...customerResponse.data,
            upcomingAppointments,
            appointmentHistory
        };
        return {
            success: true,
            data: profile
        };
    }
    /**
   * Create new customer
   */ async createCustomer(data) {
        // Validate required fields
        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Customer name is required'
            };
        }
        if (!data.email.trim()) {
            return {
                success: false,
                error: 'Customer email is required'
            };
        }
        if (!data.phone.trim()) {
            return {
                success: false,
                error: 'Customer phone is required'
            };
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                success: false,
                error: 'Invalid email format'
            };
        }
        // Check for duplicate email
        const emailExists = await customerRepository.emailExists(data.email);
        if (emailExists) {
            return {
                success: false,
                error: 'Email already exists'
            };
        }
        // Validate location exists
        const locationResponse = await locationRepository.getById(data.locationId);
        if (!locationResponse.success || !locationResponse.data) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        const customer = {
            ...data,
            companyId: locationResponse.data.companyId,
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            membershipTier: data.membershipTier,
            memberSince: new Date().toISOString(),
            communicationChannel: data.communicationChannel,
            visits: 0,
            status: 'active'
        };
        const result = await customerRepository.create(customer);
        // Update location customer count
        if (result.success) {
            await this.updateLocationCustomerCount(data.locationId);
        }
        return result;
    }
    /**
   * Update customer
   */ async updateCustomer(id, data) {
        // Validate fields if provided
        if (data.name !== undefined && !data.name.trim()) {
            return {
                success: false,
                error: 'Customer name is required'
            };
        }
        if (data.email !== undefined) {
            if (!data.email.trim()) {
                return {
                    success: false,
                    error: 'Customer email is required'
                };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return {
                    success: false,
                    error: 'Invalid email format'
                };
            }
            // Check for duplicate email (excluding current customer)
            const emailExists = await customerRepository.emailExists(data.email, id);
            if (emailExists) {
                return {
                    success: false,
                    error: 'Email already exists'
                };
            }
            data.email = data.email.trim().toLowerCase();
        }
        if (data.phone !== undefined && !data.phone.trim()) {
            return {
                success: false,
                error: 'Customer phone is required'
            };
        }
        // Trim string fields
        if (data.name) data.name = data.name.trim();
        if (data.phone) data.phone = data.phone.trim();
        if (data.address) data.address = data.address.trim();
        return customerRepository.update(id, data);
    }
    /**
   * Delete customer (with validation)
   */ async deleteCustomer(id) {
        // Check if customer has future appointments
        const upcomingResponse = await appointmentRepository.getUpcomingByCustomer(id);
        if (upcomingResponse.success && upcomingResponse.data && upcomingResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete customer with upcoming appointments. Please cancel appointments first.'
            };
        }
        // Get customer to update location count
        const customerResponse = await customerRepository.getById(id);
        if (!customerResponse.success || !customerResponse.data) {
            return {
                success: false,
                error: 'Customer not found'
            };
        }
        const locationId = customerResponse.data.locationId;
        const deleteResponse = await customerRepository.delete(id);
        // Update location customer count
        if (deleteResponse.success) {
            await this.updateLocationCustomerCount(locationId);
        }
        return deleteResponse;
    }
    /**
   * Archive customer
   */ async archiveCustomer(id) {
        return customerRepository.archive(id);
    }
    /**
   * Search customers
   */ async searchCustomers(locationId, query) {
        const filter = {
            locationId,
            search: query,
            status: 'active'
        };
        const response = await customerRepository.getFiltered(filter);
        if (!response.success || !response.data) {
            return {
                success: false,
                error: response.error
            };
        }
        // Limit results for performance
        return {
            success: true,
            data: response.data.slice(0, 20)
        };
    }
    /**
   * Get customers by location
   */ async getCustomersByLocation(locationId) {
        return customerRepository.getByLocationId(locationId);
    }
    /**
   * Get customers by membership tier
   */ async getCustomersByTier(tier, locationId) {
        const response = await customerRepository.getByMembershipTier(tier);
        if (!response.success || !response.data) {
            return response;
        }
        let customers = response.data;
        // Filter by location if specified
        if (locationId) {
            customers = customers.filter((c)=>c.locationId === locationId);
        }
        return {
            success: true,
            data: customers
        };
    }
    /**
   * Update customer visit count after appointment
   */ async recordVisit(customerId) {
        const customerResponse = await customerRepository.getById(customerId);
        if (!customerResponse.success || !customerResponse.data) {
            return {
                success: false,
                error: 'Customer not found'
            };
        }
        const customer = customerResponse.data;
        const newVisitCount = customer.visits + 1;
        const lastVisit = new Date().toISOString();
        return customerRepository.updateVisitCount(customerId, newVisitCount, lastVisit);
    }
    /**
   * Update customer balance
   */ async updateBalance(customerId, amount) {
        return customerRepository.updateBalance(customerId, amount);
    }
    /**
   * Get customer statistics
   */ async getCustomerStats(customerId) {
        try {
            const appointmentsResponse = await appointmentRepository.getByCustomerId(customerId);
            const appointments = appointmentsResponse.data || [];
            const stats = {
                totalAppointments: appointments.length,
                completedAppointments: appointments.filter((a)=>a.status === 'completed').length,
                cancelledAppointments: appointments.filter((a)=>a.status === 'cancelled').length,
                noShowAppointments: appointments.filter((a)=>a.status === 'no-show').length,
                lastAppointment: appointments.length > 0 ? appointments[0].startTime : undefined
            };
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get customer stats: ${error}`
            };
        }
    }
    /**
   * Update location customer count (internal helper)
   */ async updateLocationCustomerCount(locationId) {
        try {
            const customersResponse = await customerRepository.getByLocationId(locationId);
            const count = customersResponse.data?.filter((c)=>c.status === 'active').length || 0;
            await locationRepository.updateCustomerCount(locationId, count);
        } catch (error) {
            console.warn('Failed to update location customer count:', error);
        }
    }
}
const customerService = new CustomerService();
}),
"[project]/lib/services/staff.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Staff Service
 * 
 * Business logic for staff management
 */ __turbopack_context__.s([
    "staffService",
    ()=>staffService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
// Lazy-initialized repository accessors
const staffRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getStaffRepository"])();
const locationRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
const appointmentRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAppointmentRepository"])();
class StaffService {
    /**
   * Get all staff with pagination
   */ async getStaff(filter) {
        return staffRepository.getPaginated(filter);
    }
    /**
   * Get staff with advanced filtering
   */ async getFilteredStaff(filter) {
        return staffRepository.getFiltered(filter);
    }
    /**
   * Get staff by ID
   */ async getStaffById(id) {
        return staffRepository.getById(id);
    }
    /**
   * Get staff by location
   */ async getStaffByLocation(locationId) {
        return staffRepository.getByLocationId(locationId);
    }
    /**
   * Create new staff member
   */ async createStaff(data) {
        // Validate required fields
        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Staff name is required'
            };
        }
        if (!data.email.trim()) {
            return {
                success: false,
                error: 'Staff email is required'
            };
        }
        if (!data.phone.trim()) {
            return {
                success: false,
                error: 'Staff phone is required'
            };
        }
        if (!data.role.trim()) {
            return {
                success: false,
                error: 'Staff role is required'
            };
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                success: false,
                error: 'Invalid email format'
            };
        }
        // Check for duplicate email
        const emailExists = await staffRepository.emailExists(data.email);
        if (emailExists) {
            return {
                success: false,
                error: 'Email already exists'
            };
        }
        // Validate location exists
        const locationResponse = await locationRepository.getById(data.locationId);
        if (!locationResponse.success || !locationResponse.data) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        const staff = {
            ...data,
            companyId: locationResponse.data.companyId,
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            role: data.role.trim(),
            status: 'active',
            joinedDate: new Date().toISOString()
        };
        const result = await staffRepository.create(staff);
        // Update location staff count
        if (result.success) {
            await this.updateLocationStaffCount(data.locationId);
        }
        return result;
    }
    /**
   * Update staff member
   */ async updateStaff(id, data) {
        // Validate fields if provided
        if (data.name !== undefined && !data.name.trim()) {
            return {
                success: false,
                error: 'Staff name is required'
            };
        }
        if (data.email !== undefined) {
            if (!data.email.trim()) {
                return {
                    success: false,
                    error: 'Staff email is required'
                };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return {
                    success: false,
                    error: 'Invalid email format'
                };
            }
            // Check for duplicate email (excluding current staff)
            const emailExists = await staffRepository.emailExists(data.email, id);
            if (emailExists) {
                return {
                    success: false,
                    error: 'Email already exists'
                };
            }
            data.email = data.email.trim().toLowerCase();
        }
        if (data.phone !== undefined && !data.phone.trim()) {
            return {
                success: false,
                error: 'Staff phone is required'
            };
        }
        if (data.role !== undefined && !data.role.trim()) {
            return {
                success: false,
                error: 'Staff role is required'
            };
        }
        // Trim string fields
        if (data.name) data.name = data.name.trim();
        if (data.phone) data.phone = data.phone.trim();
        if (data.role) data.role = data.role.trim();
        return staffRepository.update(id, data);
    }
    /**
   * Delete staff member (with validation)
   */ async deleteStaff(id) {
        // Check if staff has future appointments
        const today = new Date().toISOString().split('T')[0];
        const futureAppointmentsResponse = await appointmentRepository.getFiltered({
            staffId: id,
            dateFrom: today,
            status: 'scheduled'
        });
        if (futureAppointmentsResponse.success && futureAppointmentsResponse.data && futureAppointmentsResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete staff member with future appointments. Please reassign appointments first.'
            };
        }
        // Get staff to update location count
        const staffResponse = await staffRepository.getById(id);
        if (!staffResponse.success || !staffResponse.data) {
            return {
                success: false,
                error: 'Staff member not found'
            };
        }
        const locationId = staffResponse.data.locationId;
        const deleteResponse = await staffRepository.delete(id);
        // Update location staff count
        if (deleteResponse.success) {
            await this.updateLocationStaffCount(locationId);
        }
        return deleteResponse;
    }
    /**
   * Archive staff member
   */ async archiveStaff(id) {
        const result = await staffRepository.archive(id);
        // Update location staff count
        if (result.success && result.data) {
            await this.updateLocationStaffCount(result.data.locationId);
        }
        return result;
    }
    /**
   * Get staff by role
   */ async getStaffByRole(role, locationId) {
        const response = await staffRepository.getByRole(role);
        if (!response.success || !response.data) {
            return response;
        }
        let staff = response.data;
        // Filter by location if specified
        if (locationId) {
            staff = staff.filter((s)=>s.locationId === locationId);
        }
        return {
            success: true,
            data: staff
        };
    }
    /**
   * Update room assignments
   */ async updateRoomAssignments(staffId, roomIds) {
        return staffRepository.updateRoomAssignments(staffId, roomIds);
    }
    /**
   * Search staff members
   */ async searchStaff(locationId, query) {
        const filter = {
            locationId,
            search: query,
            status: 'active'
        };
        const response = await staffRepository.getFiltered(filter);
        if (!response.success || !response.data) {
            return {
                success: false,
                error: response.error
            };
        }
        // Limit results for performance
        return {
            success: true,
            data: response.data.slice(0, 20)
        };
    }
    /**
   * Get staff availability for a specific date
   */ async getStaffAvailability(staffId, date) {
        try {
            // Get staff member
            const staffResponse = await staffRepository.getById(staffId);
            if (!staffResponse.success || !staffResponse.data) {
                return {
                    success: false,
                    error: 'Staff member not found'
                };
            }
            // Get appointments for the date
            const appointmentsResponse = await appointmentRepository.getFiltered({
                staffId,
                date,
                status: 'scheduled'
            });
            const appointments = appointmentsResponse.data || [];
            // Simplified working hours (9 AM to 6 PM)
            const workingHours = {
                start: '09:00',
                end: '18:00'
            };
            return {
                success: true,
                data: {
                    available: appointments.length < 8,
                    appointments,
                    workingHours
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get staff availability: ${error}`
            };
        }
    }
    /**
   * Get staff statistics
   */ async getStaffStats(staffId) {
        try {
            const appointmentsResponse = await appointmentRepository.getByStaffId(staffId);
            const appointments = appointmentsResponse.data || [];
            const now = new Date();
            const upcoming = appointments.filter((a)=>new Date(a.startTime) > now && a.status === 'scheduled');
            const stats = {
                totalAppointments: appointments.length,
                completedAppointments: appointments.filter((a)=>a.status === 'completed').length,
                cancelledAppointments: appointments.filter((a)=>a.status === 'cancelled').length,
                upcomingAppointments: upcoming.length
            };
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get staff stats: ${error}`
            };
        }
    }
    /**
   * Update location staff count (internal helper)
   */ async updateLocationStaffCount(locationId) {
        try {
            const staffResponse = await staffRepository.getByLocationId(locationId);
            const count = staffResponse.data?.filter((s)=>s.status === 'active').length || 0;
            await locationRepository.updateStaffCount(locationId, count);
        } catch (error) {
            console.warn('Failed to update location staff count:', error);
        }
    }
}
const staffService = new StaffService();
}),
"[project]/lib/services/room.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Room Service
 * 
 * Business logic for room management
 */ __turbopack_context__.s([
    "roomService",
    ()=>roomService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
// Lazy-initialized repository accessors
const roomRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRoomRepository"])();
const locationRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
const serviceRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getServiceRepository"])();
const appointmentRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAppointmentRepository"])();
class RoomService {
    /**
   * Get all rooms with pagination
   */ async getRooms(filter) {
        return roomRepository.getPaginated(filter);
    }
    /**
   * Get room by ID
   */ async getRoomById(id) {
        return roomRepository.getById(id);
    }
    /**
   * Get rooms by location
   */ async getRoomsByLocation(locationId) {
        return roomRepository.getByLocationId(locationId);
    }
    /**
   * Create new room
   */ async createRoom(data) {
        // Validate required fields
        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Room name is required'
            };
        }
        // Validate location exists
        const locationResponse = await locationRepository.getById(data.locationId);
        if (!locationResponse.success || !locationResponse.data) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        // Check for duplicate name within location
        const existingResponse = await roomRepository.getByLocationId(data.locationId);
        if (existingResponse.success && existingResponse.data) {
            const duplicate = existingResponse.data.find((r)=>r.name.toLowerCase() === data.name.toLowerCase());
            if (duplicate) {
                return {
                    success: false,
                    error: 'Room name already exists in this location'
                };
            }
        }
        const room = {
            ...data,
            companyId: locationResponse.data.companyId,
            name: data.name.trim(),
            type: data.type,
            status: 'active'
        };
        return roomRepository.create(room);
    }
    /**
   * Update room
   */ async updateRoom(id, data) {
        // Validate name if provided
        if (data.name !== undefined) {
            if (!data.name.trim()) {
                return {
                    success: false,
                    error: 'Room name is required'
                };
            }
            // Get current room to check location
            const currentResponse = await roomRepository.getById(id);
            if (!currentResponse.success || !currentResponse.data) {
                return {
                    success: false,
                    error: 'Room not found'
                };
            }
            // Check for duplicate name within location (excluding current room)
            const existingResponse = await roomRepository.getByLocationId(currentResponse.data.locationId);
            if (existingResponse.success && existingResponse.data) {
                const duplicate = existingResponse.data.find((r)=>r.id !== id && r.name.toLowerCase() === data.name.toLowerCase());
                if (duplicate) {
                    return {
                        success: false,
                        error: 'Room name already exists in this location'
                    };
                }
            }
            data.name = data.name.trim();
        }
        return roomRepository.update(id, data);
    }
    /**
   * Delete room (with validation)
   */ async deleteRoom(id) {
        // Check if room is assigned to any services
        const servicesResponse = await serviceRepository.getByRoomId(id);
        if (servicesResponse.success && servicesResponse.data && servicesResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete room that is assigned to services. Please update services first.'
            };
        }
        // Check if room has future appointments
        const today = new Date().toISOString().split('T')[0];
        const futureAppointmentsResponse = await appointmentRepository.getFiltered({
            roomId: id,
            dateFrom: today,
            status: 'scheduled'
        });
        if (futureAppointmentsResponse.success && futureAppointmentsResponse.data && futureAppointmentsResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete room with future appointments. Please reassign appointments first.'
            };
        }
        return roomRepository.delete(id);
    }
    /**
   * Archive room
   */ async archiveRoom(id) {
        return roomRepository.archive(id);
    }
    /**
   * Get available rooms for a location
   */ async getAvailableRooms(locationId) {
        return roomRepository.getAvailableByLocationId(locationId);
    }
    /**
   * Get rooms by type
   */ async getRoomsByType(type, locationId) {
        const response = await roomRepository.getByType(type);
        if (!response.success || !response.data) {
            return response;
        }
        let rooms = response.data;
        // Filter by location if specified
        if (locationId) {
            rooms = rooms.filter((r)=>r.locationId === locationId);
        }
        return {
            success: true,
            data: rooms
        };
    }
    /**
   * Get room utilization
   */ async getRoomUtilization(roomId, startDate, endDate) {
        try {
            // Get appointments for the room in the date range
            const appointmentsResponse = await appointmentRepository.getFiltered({
                roomId,
                dateFrom: startDate,
                dateTo: endDate,
                status: 'scheduled'
            });
            const appointments = appointmentsResponse.data || [];
            // Calculate total available slots (simplified: 9 AM to 6 PM, 30-min slots)
            const daysInRange = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
            const slotsPerDay = 18; // 9 hours * 2 (30-min slots)
            const totalSlots = daysInRange * slotsPerDay;
            const bookedSlots = appointments.length;
            const utilizationRate = totalSlots > 0 ? bookedSlots / totalSlots * 100 : 0;
            return {
                success: true,
                data: {
                    totalSlots,
                    bookedSlots,
                    utilizationRate: Math.round(utilizationRate * 100) / 100,
                    appointments
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get room utilization: ${error}`
            };
        }
    }
}
const roomService = new RoomService();
}),
"[project]/lib/services/service.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Service Service
 * 
 * Business logic for service management
 */ __turbopack_context__.s([
    "serviceService",
    ()=>serviceService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
// Lazy-initialized repository accessors
const serviceRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getServiceRepository"])();
const locationRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
const appointmentRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAppointmentRepository"])();
class ServiceService {
    /**
   * Get all services with pagination
   */ async getServices(filter) {
        return serviceRepository.getPaginated(filter);
    }
    /**
   * Get service by ID
   */ async getServiceById(id) {
        return serviceRepository.getById(id);
    }
    /**
   * Get services by location
   */ async getServicesByLocation(locationId) {
        return serviceRepository.getByLocationId(locationId);
    }
    /**
   * Create new service
   */ async createService(data) {
        // Validate required fields
        if (!data.name.trim()) {
            return {
                success: false,
                error: 'Service name is required'
            };
        }
        if (!data.duration || data.duration <= 0) {
            return {
                success: false,
                error: 'Valid service duration is required'
            };
        }
        // Validate location exists
        const locationResponse = await locationRepository.getById(data.locationId);
        if (!locationResponse.success || !locationResponse.data) {
            return {
                success: false,
                error: 'Location not found'
            };
        }
        // Check for duplicate name within location
        const existingResponse = await serviceRepository.getByLocationId(data.locationId);
        if (existingResponse.success && existingResponse.data) {
            const duplicate = existingResponse.data.find((s)=>s.name.toLowerCase() === data.name.toLowerCase());
            if (duplicate) {
                return {
                    success: false,
                    error: 'Service name already exists in this location'
                };
            }
        }
        const service = {
            ...data,
            companyId: locationResponse.data.companyId,
            name: data.name.trim(),
            status: 'active'
        };
        return serviceRepository.create(service);
    }
    /**
   * Update service
   */ async updateService(id, data) {
        // Validate fields if provided
        if (data.name !== undefined && !data.name.trim()) {
            return {
                success: false,
                error: 'Service name is required'
            };
        }
        if (data.duration !== undefined && data.duration <= 0) {
            return {
                success: false,
                error: 'Valid service duration is required'
            };
        }
        // Check for duplicate name if name is being updated
        if (data.name) {
            const currentResponse = await serviceRepository.getById(id);
            if (!currentResponse.success || !currentResponse.data) {
                return {
                    success: false,
                    error: 'Service not found'
                };
            }
            const existingResponse = await serviceRepository.getByLocationId(currentResponse.data.locationId);
            if (existingResponse.success && existingResponse.data) {
                const duplicate = existingResponse.data.find((s)=>s.id !== id && s.name.toLowerCase() === data.name.toLowerCase());
                if (duplicate) {
                    return {
                        success: false,
                        error: 'Service name already exists in this location'
                    };
                }
            }
            data.name = data.name.trim();
        }
        return serviceRepository.update(id, data);
    }
    /**
   * Delete service (with validation)
   */ async deleteService(id) {
        // Check if service has future appointments
        const today = new Date().toISOString().split('T')[0];
        const futureAppointmentsResponse = await appointmentRepository.getFiltered({
            serviceId: id,
            dateFrom: today,
            status: 'scheduled'
        });
        if (futureAppointmentsResponse.success && futureAppointmentsResponse.data && futureAppointmentsResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot delete service with future appointments. Please cancel appointments first.'
            };
        }
        return serviceRepository.delete(id);
    }
    /**
   * Archive service
   */ async archiveService(id) {
        return serviceRepository.archive(id);
    }
    /**
   * Get available services for a location
   */ async getAvailableServices(locationId) {
        return serviceRepository.getAvailableByLocationId(locationId);
    }
    /**
   * Get services by category
   */ async getServicesByCategory(category, locationId) {
        const response = await serviceRepository.getByCategory(category);
        if (!response.success || !response.data) {
            return response;
        }
        let services = response.data;
        // Filter by location if specified
        if (locationId) {
            services = services.filter((s)=>s.locationId === locationId);
        }
        return {
            success: true,
            data: services
        };
    }
    /**
   * Get services by duration range
   */ async getServicesByDuration(minDuration, maxDuration, locationId) {
        const response = await serviceRepository.getByDurationRange(minDuration, maxDuration);
        if (!response.success || !response.data) {
            return response;
        }
        let services = response.data;
        // Filter by location if specified
        if (locationId) {
            services = services.filter((s)=>s.locationId === locationId);
        }
        return {
            success: true,
            data: services
        };
    }
    /**
   * Get service popularity (based on appointments)
   */ async getServicePopularity(serviceId, startDate, endDate) {
        try {
            const appointmentsResponse = await appointmentRepository.getFiltered({
                serviceId,
                dateFrom: startDate,
                dateTo: endDate
            });
            const appointments = appointmentsResponse.data || [];
            const completed = appointments.filter((a)=>a.status === 'completed').length;
            const cancelled = appointments.filter((a)=>a.status === 'cancelled').length;
            const total = appointments.length;
            // Calculate popularity score (completed / total * 100)
            const popularityScore = total > 0 ? completed / total * 100 : 0;
            return {
                success: true,
                data: {
                    totalAppointments: total,
                    completedAppointments: completed,
                    cancelledAppointments: cancelled,
                    popularityScore: Math.round(popularityScore * 100) / 100
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get service popularity: ${error}`
            };
        }
    }
    /**
   * Get service statistics
   */ async getServiceStats(locationId) {
        try {
            let servicesResponse;
            if (locationId) {
                servicesResponse = await serviceRepository.getByLocationId(locationId);
            } else {
                servicesResponse = await serviceRepository.getAll({
                    status: 'active'
                });
            }
            const services = servicesResponse.data || [];
            const activeServices = services.filter((s)=>s.status === 'active');
            // Calculate average duration
            const totalDuration = activeServices.reduce((sum, s)=>sum + s.duration, 0);
            const averageDuration = activeServices.length > 0 ? totalDuration / activeServices.length : 0;
            // Group by category
            const categoryMap = new Map();
            activeServices.forEach((service)=>{
                const category = service.category || 'Uncategorized';
                categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
            });
            const categories = Array.from(categoryMap.entries()).map(([category, count])=>({
                    category,
                    count
                }));
            return {
                success: true,
                data: {
                    totalServices: services.length,
                    activeServices: activeServices.length,
                    averageDuration: Math.round(averageDuration),
                    categories
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get service stats: ${error}`
            };
        }
    }
}
const serviceService = new ServiceService();
}),
"[project]/lib/services/appointment.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Appointment Service
 * 
 * Business logic for appointment management including booking, status transitions, and availability
 */ __turbopack_context__.s([
    "appointmentService",
    ()=>appointmentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$customer$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/customer.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/entities.ts [app-ssr] (ecmascript)");
;
;
;
// Lazy-initialized repository accessors
const appointmentRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAppointmentRepository"])();
const customerRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomerRepository"])();
const staffRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getStaffRepository"])();
const serviceRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getServiceRepository"])();
const roomRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRoomRepository"])();
const locationRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
class AppointmentService {
    /**
   * Get appointments with pagination
   */ async getAppointments(filter) {
        return appointmentRepository.getPaginated(filter);
    }
    /**
   * Get appointments with filtering
   */ async getFilteredAppointments(filter) {
        return appointmentRepository.getFiltered(filter);
    }
    /**
   * Get appointment by ID with related data
   */ async getAppointmentById(id) {
        const appointmentResponse = await appointmentRepository.getById(id);
        if (!appointmentResponse.success || !appointmentResponse.data) {
            return {
                success: false,
                error: appointmentResponse.error
            };
        }
        return this.populateAppointmentRelations(appointmentResponse.data);
    }
    /**
   * Get today's appointments by location
   */ async getTodaysAppointments(locationId) {
        return appointmentRepository.getTodaysByLocation(locationId);
    }
    /**
   * Get appointments by date range
   */ async getAppointmentsByDateRange(startDate, endDate, locationId) {
        const response = await appointmentRepository.getByDateRange(startDate, endDate);
        if (!response.success || !response.data) {
            return response;
        }
        let appointments = response.data;
        // Filter by location if specified
        if (locationId) {
            appointments = appointments.filter((a)=>a.locationId === locationId);
        }
        return {
            success: true,
            data: appointments
        };
    }
    /**
   * Create booking with validation
   */ async createBooking(booking) {
        // Validate booking request
        const validationResponse = await this.validateBooking(booking);
        if (!validationResponse.success || !validationResponse.data?.valid) {
            return {
                success: false,
                error: validationResponse.data?.errors.join(', ') || 'Booking validation failed'
            };
        }
        // Get service details for duration
        const serviceResponse = await serviceRepository.getById(booking.serviceId);
        if (!serviceResponse.success || !serviceResponse.data) {
            return {
                success: false,
                error: 'Service not found'
            };
        }
        const service = serviceResponse.data;
        const startTime = new Date(`${booking.date}T${booking.startTime}`);
        const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);
        // Get customer for company ID
        const customerResponse = await customerRepository.getById(booking.customerId);
        if (!customerResponse.success || !customerResponse.data) {
            return {
                success: false,
                error: 'Customer not found'
            };
        }
        const appointment = {
            locationId: customerResponse.data.locationId,
            companyId: customerResponse.data.companyId,
            customerId: booking.customerId,
            staffId: booking.staffId,
            serviceId: booking.serviceId,
            roomId: booking.roomId,
            date: booking.date,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: service.duration,
            status: 'scheduled',
            notes: booking.notes
        };
        return appointmentRepository.create(appointment);
    }
    /**
   * Validate booking request
   */ async validateBooking(booking, excludeAppointmentId) {
        const errors = [];
        const warnings = [];
        try {
            // Check if customer exists
            const customerResponse = await customerRepository.getById(booking.customerId);
            if (!customerResponse.success || !customerResponse.data) {
                errors.push('Customer not found');
            }
            // Check if staff exists
            const staffResponse = await staffRepository.getById(booking.staffId);
            if (!staffResponse.success || !staffResponse.data) {
                errors.push('Staff member not found');
            }
            // Check if service exists
            const serviceResponse = await serviceRepository.getById(booking.serviceId);
            if (!serviceResponse.success || !serviceResponse.data) {
                errors.push('Service not found');
            }
            // Check if room exists
            const roomResponse = await roomRepository.getById(booking.roomId);
            if (!roomResponse.success || !roomResponse.data) {
                errors.push('Room not found');
            }
            // If basic entities don't exist, return early
            if (errors.length > 0) {
                return {
                    success: true,
                    data: {
                        valid: false,
                        errors,
                        warnings
                    }
                };
            }
            const service = serviceResponse.data;
            const startTime = new Date(`${booking.date}T${booking.startTime}`);
            const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);
            // Check for scheduling conflicts
            const conflictsResponse = await appointmentRepository.checkConflicts(booking.staffId, booking.roomId, startTime.toISOString(), endTime.toISOString(), excludeAppointmentId);
            if (conflictsResponse.success && conflictsResponse.data && conflictsResponse.data.length > 0) {
                errors.push('Time slot conflicts with existing appointment');
            }
            // Check if booking is in the past
            const now = new Date();
            if (startTime <= now) {
                errors.push('Cannot book appointments in the past');
            }
            // Check if booking is too far in the future (optional business rule)
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            if (startTime > sixMonthsFromNow) {
                warnings.push('Booking is more than 6 months in the future');
            }
            return {
                success: true,
                data: {
                    valid: errors.length === 0,
                    errors,
                    warnings
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Validation failed: ${error}`
            };
        }
    }
    /**
   * Update appointment
   */ async updateAppointment(id, data) {
        // If updating scheduling details, validate
        if (data.staffId || data.roomId || data.startTime || data.endTime) {
            const currentResponse = await appointmentRepository.getById(id);
            if (!currentResponse.success || !currentResponse.data) {
                return {
                    success: false,
                    error: 'Appointment not found'
                };
            }
            const current = currentResponse.data;
            // Create booking request from current + new data
            if (data.startTime) {
                const booking = {
                    customerId: current.customerId,
                    serviceId: current.serviceId,
                    staffId: data.staffId || current.staffId,
                    roomId: data.roomId || current.roomId,
                    date: data.startTime.split('T')[0],
                    startTime: data.startTime.split('T')[1].substring(0, 5)
                };
                const validationResponse = await this.validateBooking(booking, id);
                if (!validationResponse.success || !validationResponse.data?.valid) {
                    return {
                        success: false,
                        error: validationResponse.data?.errors.join(', ') || 'Update validation failed'
                    };
                }
            }
        }
        return appointmentRepository.update(id, data);
    }
    /**
   * Cancel appointment
   */ async cancelAppointment(id, reason, notes, cancelledBy) {
        const currentResponse = await appointmentRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        const current = currentResponse.data;
        // Validate status transition
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidStatusTransition"])(current.status, 'cancelled')) {
            return {
                success: false,
                error: `Cannot cancel appointment with status: ${current.status}`
            };
        }
        return appointmentRepository.update(id, {
            status: 'cancelled',
            cancellationReason: reason,
            cancellationNotes: notes,
            cancelledAt: new Date().toISOString(),
            cancelledBy
        });
    }
    /**
   * Check in appointment
   */ async checkInAppointment(id) {
        const currentResponse = await appointmentRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        const current = currentResponse.data;
        // Validate status transition
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidStatusTransition"])(current.status, 'checked-in')) {
            return {
                success: false,
                error: `Cannot check in appointment with status: ${current.status}`
            };
        }
        return appointmentRepository.update(id, {
            status: 'checked-in',
            checkedInAt: new Date().toISOString()
        });
    }
    /**
   * Complete appointment
   */ async completeAppointment(id, notes) {
        const currentResponse = await appointmentRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        const current = currentResponse.data;
        // Validate status transition
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidStatusTransition"])(current.status, 'completed')) {
            return {
                success: false,
                error: `Cannot complete appointment with status: ${current.status}`
            };
        }
        const result = await appointmentRepository.update(id, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            internalNotes: notes ? `${current.internalNotes || ''}\n${notes}`.trim() : current.internalNotes
        });
        // Record customer visit
        if (result.success && result.data) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$customer$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerService"].recordVisit(current.customerId);
        }
        return result;
    }
    /**
   * Mark appointment as no-show
   */ async markNoShow(id, notes) {
        const currentResponse = await appointmentRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        const current = currentResponse.data;
        // Validate status transition
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidStatusTransition"])(current.status, 'no-show')) {
            return {
                success: false,
                error: `Cannot mark as no-show appointment with status: ${current.status}`
            };
        }
        return appointmentRepository.update(id, {
            status: 'no-show',
            internalNotes: notes ? `${current.internalNotes || ''}\nNo-show: ${notes}`.trim() : current.internalNotes
        });
    }
    /**
   * Restore cancelled or no-show appointment
   */ async restoreAppointment(id) {
        const currentResponse = await appointmentRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        const current = currentResponse.data;
        // Validate status transition
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$entities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidStatusTransition"])(current.status, 'scheduled')) {
            return {
                success: false,
                error: `Cannot restore appointment with status: ${current.status}`
            };
        }
        // Check if appointment time is still available
        const conflictsResponse = await appointmentRepository.checkConflicts(current.staffId, current.roomId, current.startTime, current.endTime, id);
        if (conflictsResponse.success && conflictsResponse.data && conflictsResponse.data.length > 0) {
            return {
                success: false,
                error: 'Cannot restore - time slot is no longer available'
            };
        }
        return appointmentRepository.update(id, {
            status: 'scheduled',
            cancellationReason: undefined,
            cancellationNotes: undefined,
            cancelledAt: undefined,
            cancelledBy: undefined
        });
    }
    /**
   * Delete appointment
   */ async deleteAppointment(id) {
        const currentResponse = await appointmentRepository.getById(id);
        if (!currentResponse.success || !currentResponse.data) {
            return {
                success: false,
                error: 'Appointment not found'
            };
        }
        const current = currentResponse.data;
        // Only allow deletion of cancelled or no-show appointments
        if (![
            'cancelled',
            'no-show'
        ].includes(current.status)) {
            return {
                success: false,
                error: 'Can only delete cancelled or no-show appointments'
            };
        }
        return appointmentRepository.delete(id);
    }
    /**
   * Get available time slots
   */ async getAvailableSlots(locationId, serviceId, staffId, date) {
        try {
            // Get service details
            const serviceResponse = await serviceRepository.getById(serviceId);
            if (!serviceResponse.success || !serviceResponse.data) {
                return {
                    success: false,
                    error: 'Service not found'
                };
            }
            const service = serviceResponse.data;
            // Get staff schedule (simplified - assuming 9 AM to 6 PM)
            const workStart = 9 * 60; // 9 AM in minutes
            const workEnd = 18 * 60; // 6 PM in minutes
            const slotDuration = service.duration;
            // Get existing appointments for the day
            const existingResponse = await appointmentRepository.getByDate(date);
            const existingAppointments = existingResponse.data?.filter((a)=>a.staffId === staffId && [
                    'scheduled',
                    'checked-in'
                ].includes(a.status)) || [];
            const slots = [];
            // Generate potential slots
            for(let minutes = workStart; minutes + slotDuration <= workEnd; minutes += 30){
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const startTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                const slotStart = new Date(`${date}T${startTime}`);
                const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
                // Check if slot conflicts with existing appointments
                const hasConflict = existingAppointments.some((apt)=>{
                    const aptStart = new Date(apt.startTime).getTime();
                    const aptEnd = new Date(apt.endTime).getTime();
                    return slotStart.getTime() < aptEnd && slotEnd.getTime() > aptStart;
                });
                slots.push({
                    date,
                    startTime,
                    endTime: slotEnd.toTimeString().substring(0, 5),
                    staffId,
                    roomId: service.roomId || '',
                    available: !hasConflict,
                    reason: hasConflict ? 'Slot unavailable' : undefined
                });
            }
            return {
                success: true,
                data: slots
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get available slots: ${error}`
            };
        }
    }
    /**
   * Get appointment statistics
   */ async getAppointmentStats(locationId, dateFrom, dateTo) {
        try {
            const filter = {};
            if (locationId) filter.locationId = locationId;
            if (dateFrom) filter.dateFrom = dateFrom;
            if (dateTo) filter.dateTo = dateTo;
            const response = await appointmentRepository.getFiltered(filter);
            const appointments = response.data || [];
            const stats = {
                total: appointments.length,
                scheduled: appointments.filter((a)=>a.status === 'scheduled').length,
                checkedIn: appointments.filter((a)=>a.status === 'checked-in').length,
                completed: appointments.filter((a)=>a.status === 'completed').length,
                cancelled: appointments.filter((a)=>a.status === 'cancelled').length,
                noShow: appointments.filter((a)=>a.status === 'no-show').length
            };
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get appointment stats: ${error}`
            };
        }
    }
    /**
   * Populate appointment with related entity data
   */ async populateAppointmentRelations(appointment) {
        try {
            const [customerRes, staffRes, serviceRes, roomRes, locationRes] = await Promise.all([
                customerRepository.getById(appointment.customerId),
                staffRepository.getById(appointment.staffId),
                serviceRepository.getById(appointment.serviceId),
                roomRepository.getById(appointment.roomId),
                locationRepository.getById(appointment.locationId)
            ]);
            if (!customerRes.success || !staffRes.success || !serviceRes.success || !roomRes.success || !locationRes.success) {
                return {
                    success: false,
                    error: 'Failed to load related data'
                };
            }
            const populated = {
                ...appointment,
                customer: customerRes.data,
                staff: staffRes.data,
                service: serviceRes.data,
                room: roomRes.data,
                location: locationRes.data
            };
            return {
                success: true,
                data: populated
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to populate relations: ${error}`
            };
        }
    }
}
const appointmentService = new AppointmentService();
}),
"[project]/lib/services/dashboard.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Dashboard Service
 * 
 * Business logic for dashboard metrics and analytics
 */ __turbopack_context__.s([
    "dashboardService",
    ()=>dashboardService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/repositories/index.ts [app-ssr] (ecmascript) <locals>");
;
// Lazy-initialized repository accessors
const appointmentRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAppointmentRepository"])();
const customerRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomerRepository"])();
const staffRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getStaffRepository"])();
const locationRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLocationRepository"])();
const companyRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$repositories$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCompanyRepository"])();
class DashboardService {
    /**
   * Get dashboard statistics for a given scope
   */ async getDashboardStats(scope) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const thisWeekStart = this.getWeekStart(new Date()).toISOString().split('T')[0];
            const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            // Get today's appointments
            const todaysAppointmentsResponse = await appointmentRepository.getFiltered({
                date: today,
                ...scope.locationIds?.length ? {
                    locationId: scope.locationIds[0]
                } : {}
            });
            const todaysAppointments = todaysAppointmentsResponse.data || [];
            // Get this week's appointments
            const thisWeekResponse = await appointmentRepository.getByDateRange(thisWeekStart, today);
            let thisWeekAppointments = thisWeekResponse.data || [];
            // Get this month's appointments
            const thisMonthResponse = await appointmentRepository.getByDateRange(thisMonthStart, today);
            let thisMonthAppointments = thisMonthResponse.data || [];
            // Apply scope filtering
            if (scope.locationIds?.length) {
                thisWeekAppointments = thisWeekAppointments.filter((a)=>scope.locationIds.includes(a.locationId));
                thisMonthAppointments = thisMonthAppointments.filter((a)=>scope.locationIds.includes(a.locationId));
            } else if (scope.companyIds?.length) {
                thisWeekAppointments = thisWeekAppointments.filter((a)=>scope.companyIds.includes(a.companyId));
                thisMonthAppointments = thisMonthAppointments.filter((a)=>scope.companyIds.includes(a.companyId));
            }
            // Count customers
            let totalCustomers = 0;
            if (scope.locationIds?.length) {
                for (const locationId of scope.locationIds){
                    const customersResponse = await customerRepository.getByLocationId(locationId);
                    totalCustomers += customersResponse.data?.filter((c)=>c.status === 'active').length || 0;
                }
            } else if (scope.companyIds?.length) {
                for (const companyId of scope.companyIds){
                    const customersResponse = await customerRepository.getByCompanyId(companyId);
                    totalCustomers += customersResponse.data?.filter((c)=>c.status === 'active').length || 0;
                }
            } else {
                const allCustomersResponse = await customerRepository.getAll({
                    status: 'active'
                });
                totalCustomers = allCustomersResponse.data?.length || 0;
            }
            // Count staff
            let totalStaff = 0;
            if (scope.locationIds?.length) {
                for (const locationId of scope.locationIds){
                    const staffResponse = await staffRepository.getByLocationId(locationId);
                    totalStaff += staffResponse.data?.filter((s)=>s.status === 'active').length || 0;
                }
            } else if (scope.companyIds?.length) {
                for (const companyId of scope.companyIds){
                    const staffResponse = await staffRepository.getByCompanyId(companyId);
                    totalStaff += staffResponse.data?.filter((s)=>s.status === 'active').length || 0;
                }
            } else {
                const allStaffResponse = await staffRepository.getAll({
                    status: 'active'
                });
                totalStaff = allStaffResponse.data?.length || 0;
            }
            // Count locations and companies based on scope
            let totalLocations = 0;
            let totalCompanies = 0;
            if (scope.locationIds?.length) {
                totalLocations = scope.locationIds.length;
                // Get unique company IDs for these locations
                const locations = await Promise.all(scope.locationIds.map((id)=>locationRepository.getById(id)));
                const companyIds = new Set(locations.filter((l)=>l.success && l.data).map((l)=>l.data.companyId));
                totalCompanies = companyIds.size;
            } else if (scope.companyIds?.length) {
                totalCompanies = scope.companyIds.length;
                for (const companyId of scope.companyIds){
                    const locationsResponse = await locationRepository.getByCompanyId(companyId);
                    totalLocations += locationsResponse.data?.filter((l)=>l.status === 'active').length || 0;
                }
            } else {
                const allCompaniesResponse = await companyRepository.getAll({
                    status: 'active'
                });
                const allLocationsResponse = await locationRepository.getAll({
                    status: 'active'
                });
                totalCompanies = allCompaniesResponse.data?.length || 0;
                totalLocations = allLocationsResponse.data?.length || 0;
            }
            const stats = {
                // Today's metrics
                todayAppointments: todaysAppointments.length,
                todayCheckedIn: todaysAppointments.filter((a)=>a.status === 'checked-in').length,
                todayCompleted: todaysAppointments.filter((a)=>a.status === 'completed').length,
                todayScheduled: todaysAppointments.filter((a)=>a.status === 'scheduled').length,
                todayNoShows: todaysAppointments.filter((a)=>a.status === 'no-show').length,
                todayCancelled: todaysAppointments.filter((a)=>a.status === 'cancelled').length,
                // Overall metrics
                totalCustomers,
                totalStaff,
                totalLocations,
                totalCompanies,
                // Period metrics
                thisWeekAppointments: thisWeekAppointments.length,
                thisMonthAppointments: thisMonthAppointments.length
            };
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get dashboard stats: ${error}`
            };
        }
    }
    /**
   * Get activity feed
   */ async getActivityFeed(scope, limit = 20) {
        try {
            const activities = [];
            // Get recent appointments (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const startDate = sevenDaysAgo.toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            const recentAppointmentsResponse = await appointmentRepository.getByDateRange(startDate, today);
            let recentAppointments = recentAppointmentsResponse.data || [];
            // Apply scope filtering
            if (scope.locationIds?.length) {
                recentAppointments = recentAppointments.filter((a)=>scope.locationIds.includes(a.locationId));
            } else if (scope.companyIds?.length) {
                recentAppointments = recentAppointments.filter((a)=>scope.companyIds.includes(a.companyId));
            }
            // Convert appointments to activity items
            for (const appointment of recentAppointments.slice(-10)){
                let type = 'appointment';
                let title = '';
                let description = '';
                switch(appointment.status){
                    case 'scheduled':
                        title = 'Appointment Scheduled';
                        description = `New appointment scheduled for ${appointment.date}`;
                        break;
                    case 'checked-in':
                        type = 'check-in';
                        title = 'Customer Checked In';
                        description = `Customer checked in for appointment`;
                        break;
                    case 'completed':
                        title = 'Appointment Completed';
                        description = `Appointment completed successfully`;
                        break;
                    case 'cancelled':
                        type = 'cancellation';
                        title = 'Appointment Cancelled';
                        description = `Appointment cancelled: ${appointment.cancellationReason || 'No reason provided'}`;
                        break;
                    case 'no-show':
                        title = 'Customer No-Show';
                        description = `Customer did not show up for appointment`;
                        break;
                }
                activities.push({
                    id: appointment.id,
                    type,
                    title,
                    description,
                    timestamp: appointment.updatedAt,
                    metadata: {
                        appointmentId: appointment.id,
                        customerId: appointment.customerId,
                        status: appointment.status
                    }
                });
            }
            // Get recent customers (last 10)
            const recentCustomersResponse = await customerRepository.getAll({
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            let recentCustomers = recentCustomersResponse.data?.slice(0, 5) || [];
            // Apply scope filtering
            if (scope.locationIds?.length) {
                recentCustomers = recentCustomers.filter((c)=>scope.locationIds.includes(c.locationId));
            } else if (scope.companyIds?.length) {
                recentCustomers = recentCustomers.filter((c)=>scope.companyIds.includes(c.companyId));
            }
            // Convert customers to activity items
            for (const customer of recentCustomers){
                activities.push({
                    id: `customer-${customer.id}`,
                    type: 'customer',
                    title: 'New Customer Registered',
                    description: `${customer.name} joined as a ${customer.membershipTier} member`,
                    timestamp: customer.createdAt,
                    metadata: {
                        customerId: customer.id,
                        membershipTier: customer.membershipTier
                    }
                });
            }
            // Sort activities by timestamp (most recent first)
            activities.sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return {
                success: true,
                data: activities.slice(0, limit)
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get activity feed: ${error}`
            };
        }
    }
    /**
   * Get upcoming appointments for today
   */ async getUpcomingAppointments(scope, limit = 10) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const now = new Date();
            const todaysResponse = await appointmentRepository.getFiltered({
                date: today,
                status: 'scheduled'
            });
            let appointments = todaysResponse.data || [];
            // Apply scope filtering
            if (scope.locationIds?.length) {
                appointments = appointments.filter((a)=>scope.locationIds.includes(a.locationId));
            } else if (scope.companyIds?.length) {
                appointments = appointments.filter((a)=>scope.companyIds.includes(a.companyId));
            }
            // Filter to upcoming only and sort
            const upcoming = appointments.filter((a)=>new Date(a.startTime) > now).sort((a, b)=>new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, limit);
            return {
                success: true,
                data: upcoming
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get upcoming appointments: ${error}`
            };
        }
    }
    /**
   * Get occupancy data for locations
   */ async getLocationOccupancy(scope) {
        try {
            let locationIds = [];
            if (scope.locationIds?.length) {
                locationIds = scope.locationIds;
            } else if (scope.companyIds?.length) {
                for (const companyId of scope.companyIds){
                    const locationsResponse = await locationRepository.getByCompanyId(companyId);
                    locationIds.push(...locationsResponse.data?.map((l)=>l.id) || []);
                }
            } else {
                const allLocationsResponse = await locationRepository.getAll({
                    status: 'active'
                });
                locationIds = allLocationsResponse.data?.map((l)=>l.id) || [];
            }
            const occupancyData = [];
            const now = new Date();
            for (const locationId of locationIds.slice(0, 10)){
                const locationResponse = await locationRepository.getById(locationId);
                if (!locationResponse.success || !locationResponse.data) continue;
                const location = locationResponse.data;
                // Get current appointments (checked-in)
                const currentAppointmentsResponse = await appointmentRepository.getFiltered({
                    locationId,
                    status: 'checked-in'
                });
                const currentOccupancy = currentAppointmentsResponse.data?.length || 0;
                // Simplified capacity calculation (would be based on rooms in real implementation)
                const capacity = 10; // Default capacity
                const utilizationRate = capacity > 0 ? currentOccupancy / capacity * 100 : 0;
                occupancyData.push({
                    locationId,
                    locationName: location.name,
                    currentOccupancy,
                    capacity,
                    utilizationRate: Math.round(utilizationRate * 100) / 100
                });
            }
            return {
                success: true,
                data: occupancyData
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get location occupancy: ${error}`
            };
        }
    }
    /**
   * Helper to get start of current week
   */ getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }
}
const dashboardService = new DashboardService();
}),
"[project]/lib/services/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Service Layer Exports
 * 
 * Centralized exports for all services
 */ __turbopack_context__.s([
    "services",
    ()=>services
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$company$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/company.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$location$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/location.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$customer$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/customer.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$staff$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/staff.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$room$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/room.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$service$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/service.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$appointment$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/appointment.service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$dashboard$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/dashboard.service.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const services = {
    company: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$company$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["companyService"],
    location: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$location$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["locationService"],
    customer: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$customer$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customerService"],
    staff: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$staff$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staffService"],
    room: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$room$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["roomService"],
    service: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$service$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serviceService"],
    appointment: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$appointment$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentService"],
    dashboard: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$dashboard$2e$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboardService"]
};
}),
"[project]/lib/hooks/useData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Data Management Hooks
 * 
 * React hooks for managing application data with local persistence
 */ __turbopack_context__.s([
    "queryKeys",
    ()=>queryKeys,
    "useActivityFeed",
    ()=>useActivityFeed,
    "useAppointment",
    ()=>useAppointment,
    "useAppointmentActions",
    ()=>useAppointmentActions,
    "useAppointments",
    ()=>useAppointments,
    "useAvailableSlots",
    ()=>useAvailableSlots,
    "useBookingValidation",
    ()=>useBookingValidation,
    "useCompanies",
    ()=>useCompanies,
    "useCompany",
    ()=>useCompany,
    "useCreateAppointment",
    ()=>useCreateAppointment,
    "useCreateCompany",
    ()=>useCreateCompany,
    "useCreateCustomer",
    ()=>useCreateCustomer,
    "useCreateLocation",
    ()=>useCreateLocation,
    "useCreateRoom",
    ()=>useCreateRoom,
    "useCreateService",
    ()=>useCreateService,
    "useCreateStaff",
    ()=>useCreateStaff,
    "useCustomer",
    ()=>useCustomer,
    "useCustomerProfile",
    ()=>useCustomerProfile,
    "useCustomers",
    ()=>useCustomers,
    "useDashboardStats",
    ()=>useDashboardStats,
    "useDeleteCompany",
    ()=>useDeleteCompany,
    "useDeleteCustomer",
    ()=>useDeleteCustomer,
    "useDeleteLocation",
    ()=>useDeleteLocation,
    "useDeleteRoom",
    ()=>useDeleteRoom,
    "useDeleteService",
    ()=>useDeleteService,
    "useDeleteStaff",
    ()=>useDeleteStaff,
    "useInitializeData",
    ()=>useInitializeData,
    "useLocation",
    ()=>useLocation,
    "useLocations",
    ()=>useLocations,
    "useLocationsByCompany",
    ()=>useLocationsByCompany,
    "useRoom",
    ()=>useRoom,
    "useRooms",
    ()=>useRooms,
    "useRoomsByLocation",
    ()=>useRoomsByLocation,
    "useSearchCustomers",
    ()=>useSearchCustomers,
    "useSearchStaff",
    ()=>useSearchStaff,
    "useService",
    ()=>useService,
    "useServices",
    ()=>useServices,
    "useServicesByLocation",
    ()=>useServicesByLocation,
    "useStaff",
    ()=>useStaff,
    "useStaffByLocation",
    ()=>useStaffByLocation,
    "useStaffMember",
    ()=>useStaffMember,
    "useTodaysAppointments",
    ()=>useTodaysAppointments,
    "useUpdateAppointment",
    ()=>useUpdateAppointment,
    "useUpdateCompany",
    ()=>useUpdateCompany,
    "useUpdateCustomer",
    ()=>useUpdateCustomer,
    "useUpdateLocation",
    ()=>useUpdateLocation,
    "useUpdateRoom",
    ()=>useUpdateRoom,
    "useUpdateService",
    ()=>useUpdateService,
    "useUpdateStaff",
    ()=>useUpdateStaff
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/services/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage/indexeddb.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const queryKeys = {
    companies: [
        'companies'
    ],
    company: (id)=>[
            'companies',
            id
        ],
    locations: (filter)=>[
            'locations',
            filter
        ],
    location: (id)=>[
            'locations',
            id
        ],
    customers: (filter)=>[
            'customers',
            filter
        ],
    customer: (id)=>[
            'customers',
            id
        ],
    customerProfile: (id)=>[
            'customers',
            id,
            'profile'
        ],
    staff: (filter)=>[
            'staff',
            filter
        ],
    staffMember: (id)=>[
            'staff',
            id
        ],
    rooms: (filter)=>[
            'rooms',
            filter
        ],
    room: (id)=>[
            'rooms',
            id
        ],
    roomsByLocation: (locationId)=>[
            'rooms',
            'location',
            locationId
        ],
    services: (filter)=>[
            'services',
            filter
        ],
    service: (id)=>[
            'services',
            id
        ],
    servicesByLocation: (locationId)=>[
            'services',
            'location',
            locationId
        ],
    appointments: (filter)=>[
            'appointments',
            filter
        ],
    appointment: (id)=>[
            'appointments',
            id
        ],
    todaysAppointments: (locationId)=>[
            'appointments',
            'today',
            locationId
        ],
    availableSlots: (locationId, serviceId, staffId, date)=>[
            'appointments',
            'slots',
            locationId,
            serviceId,
            staffId,
            date
        ],
    dashboardStats: (scope)=>[
            'dashboard',
            'stats',
            scope
        ],
    activityFeed: (scope)=>[
            'dashboard',
            'activity',
            scope
        ]
};
function useInitializeData() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2f$indexeddb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeWithSeedData"],
        onSuccess: ()=>{
            console.log('Database initialized successfully');
        }
    });
}
function useCompanies(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.companies,
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].company.getCompanies(filter)
    });
}
function useCompany(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.company(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].company.getCompanyById(id),
        enabled: !!id
    });
}
function useCreateCompany() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].company.createCompany,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.companies
            });
        }
    });
}
function useUpdateCompany() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].company.updateCompany(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.companies
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.company(id)
            });
        }
    });
}
function useDeleteCompany() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].company.deleteCompany,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.companies
            });
        }
    });
}
function useLocations(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.locations(filter),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].location.getLocations(filter)
    });
}
function useLocationsByCompany(companyId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.locations({
            search: companyId
        }),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].location.getLocationsByCompanyId(companyId),
        enabled: !!companyId
    });
}
function useLocation(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.location(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].location.getLocationById(id),
        enabled: !!id
    });
}
function useCreateLocation() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].location.createLocation,
        onSuccess: (_, variables)=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.locations()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.company(variables.companyId)
            });
        }
    });
}
function useUpdateLocation() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].location.updateLocation(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.locations()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.location(id)
            });
        }
    });
}
function useDeleteLocation() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].location.deleteLocation,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.locations()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.companies
            });
        }
    });
}
function useCustomers(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.customers(filter),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.getCustomers(filter)
    });
}
function useCustomer(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.customer(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.getCustomerById(id),
        enabled: !!id
    });
}
function useCustomerProfile(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.customerProfile(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.getCustomerProfile(id),
        enabled: !!id
    });
}
function useCreateCustomer() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.createCustomer,
        onSuccess: (_, variables)=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.customers()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.location(variables.locationId)
            });
        }
    });
}
function useUpdateCustomer() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.updateCustomer(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.customers()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.customer(id)
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.customerProfile(id)
            });
        }
    });
}
function useDeleteCustomer() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.deleteCustomer,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.customers()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.locations()
            });
        }
    });
}
function useStaff(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.staff(filter),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.getStaff(filter)
    });
}
function useStaffMember(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.staffMember(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.getStaffById(id),
        enabled: !!id
    });
}
function useStaffByLocation(locationId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.staff({
            locationId
        }),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.getStaffByLocation(locationId),
        enabled: !!locationId
    });
}
function useCreateStaff() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.createStaff,
        onSuccess: (_, variables)=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.location(variables.locationId)
            });
        }
    });
}
function useUpdateStaff() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.updateStaff(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.staffMember(id)
            });
        }
    });
}
function useDeleteStaff() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.deleteStaff,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.staff()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.locations()
            });
        }
    });
}
function useRooms(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.rooms(filter),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].room.getRooms(filter)
    });
}
function useRoom(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.room(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].room.getRoomById(id),
        enabled: !!id
    });
}
function useRoomsByLocation(locationId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.roomsByLocation(locationId),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].room.getRoomsByLocation(locationId),
        enabled: !!locationId
    });
}
function useCreateRoom() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].room.createRoom,
        onSuccess: (_, variables)=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.rooms()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.roomsByLocation(variables.locationId)
            });
        }
    });
}
function useUpdateRoom() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].room.updateRoom(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.rooms()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.room(id)
            });
        }
    });
}
function useDeleteRoom() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].room.deleteRoom,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.rooms()
            });
        }
    });
}
function useServices(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.services(filter),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].service.getServices(filter)
    });
}
function useService(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.service(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].service.getServiceById(id),
        enabled: !!id
    });
}
function useServicesByLocation(locationId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.servicesByLocation(locationId),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].service.getServicesByLocation(locationId),
        enabled: !!locationId
    });
}
function useCreateService() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].service.createService,
        onSuccess: (_, variables)=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.services()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.servicesByLocation(variables.locationId)
            });
        }
    });
}
function useUpdateService() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].service.updateService(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.services()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.service(id)
            });
        }
    });
}
function useDeleteService() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].service.deleteService,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.services()
            });
        }
    });
}
function useAppointments(filter) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.appointments(filter),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.getAppointments(filter)
    });
}
function useAppointment(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.appointment(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.getAppointmentById(id),
        enabled: !!id
    });
}
function useTodaysAppointments(locationId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.todaysAppointments(locationId),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.getTodaysAppointments(locationId),
        enabled: !!locationId,
        refetchInterval: 60000
    });
}
function useAvailableSlots(locationId, serviceId, staffId, date) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.availableSlots(locationId, serviceId, staffId, date),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.getAvailableSlots(locationId, serviceId, staffId, date),
        enabled: !!(locationId && serviceId && staffId && date)
    });
}
function useCreateAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.createBooking,
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.appointments()
            });
            queryClient.invalidateQueries({
                queryKey: [
                    'appointments',
                    'today'
                ]
            });
            queryClient.invalidateQueries({
                queryKey: [
                    'appointments',
                    'slots'
                ]
            });
        }
    });
}
function useUpdateAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.updateAppointment(id, data),
        onSuccess: (_, { id })=>{
            queryClient.invalidateQueries({
                queryKey: queryKeys.appointments()
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.appointment(id)
            });
            queryClient.invalidateQueries({
                queryKey: [
                    'appointments',
                    'today'
                ]
            });
        }
    });
}
function useAppointmentActions() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const invalidateAppointmentData = ()=>{
        queryClient.invalidateQueries({
            queryKey: queryKeys.appointments()
        });
        queryClient.invalidateQueries({
            queryKey: [
                'appointments',
                'today'
            ]
        });
        queryClient.invalidateQueries({
            queryKey: [
                'dashboard'
            ]
        });
    };
    return {
        checkIn: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
            mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.checkInAppointment,
            onSuccess: invalidateAppointmentData
        }),
        complete: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
            mutationFn: ({ id, notes })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.completeAppointment(id, notes),
            onSuccess: invalidateAppointmentData
        }),
        cancel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
            mutationFn: ({ id, reason, notes })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.cancelAppointment(id, reason, notes),
            onSuccess: invalidateAppointmentData
        }),
        markNoShow: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
            mutationFn: ({ id, notes })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.markNoShow(id, notes),
            onSuccess: invalidateAppointmentData
        }),
        restore: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
            mutationFn: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.restoreAppointment,
            onSuccess: invalidateAppointmentData
        })
    };
}
function useDashboardStats(scope) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.dashboardStats(scope),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].dashboard.getDashboardStats(scope),
        refetchInterval: 300000
    });
}
function useActivityFeed(scope, limit = 20) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: queryKeys.activityFeed(scope),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].dashboard.getActivityFeed(scope, limit),
        refetchInterval: 60000
    });
}
function useBookingValidation() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (booking)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].appointment.validateBooking(booking)
    });
}
function useSearchCustomers() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ locationId, query })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].customer.searchCustomers(locationId, query)
    });
}
function useSearchStaff() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ locationId, query })=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["services"].staff.searchStaff(locationId, query)
    });
}
}),
"[project]/components/auth/AuthProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hooks/useData.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function AuthProvider({ children }) {
    const authValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthProvider"])();
    const initializeData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInitializeData"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Skip IndexedDB init if we already seeded on a previous visit
        const DB_INIT_FLAG = 'hospitality-admin-db-initialized';
        if (!localStorage.getItem(DB_INIT_FLAG)) {
            initializeData.mutate(undefined, {
                onSuccess: ()=>localStorage.setItem(DB_INIT_FLAG, '1')
            });
        }
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthContext"].Provider, {
        value: authValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/auth/AuthProvider.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11c1014c._.js.map