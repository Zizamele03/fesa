export const DB_NAME = 'FesaDB';
export const DB_VERSION = 2;

export const STORES = {
  CAREER_PROFILE: 'careerProfile',
  APPLICATIONS: 'applications',
  SETTINGS: 'settings',
};

let dbPromise = null;

export function isIndexedDbAvailable() {
  return typeof indexedDB !== 'undefined';
}

export function openDatabase() {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(
      new Error('IndexedDB is not supported in this browser.'),
    );
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORES.CAREER_PROFILE)) {
          db.createObjectStore(STORES.CAREER_PROFILE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.APPLICATIONS)) {
          const applicationsStore = db.createObjectStore(STORES.APPLICATIONS, {
            keyPath: 'id',
          });
          applicationsStore.createIndex('updatedAt', 'updatedAt', {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error || new Error('Failed to open FesaDB.'));
      };
    });
  }

  return dbPromise;
}

export function runTransaction(storeName, mode, operation) {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        let result;

        try {
          const request = operation(store);

          if (request && typeof request.onsuccess === 'function') {
            request.onsuccess = () => {
              result = request.result;
            };
          } else if (request) {
            request.onsuccess = () => {
              result = request.result;
            };
          }

          transaction.oncomplete = () => resolve(result);
          transaction.onerror = () =>
            reject(transaction.error || new Error('IndexedDB transaction failed.'));
          transaction.onabort = () =>
            reject(transaction.error || new Error('IndexedDB transaction aborted.'));
        } catch (error) {
          reject(error);
        }
      }),
  );
}