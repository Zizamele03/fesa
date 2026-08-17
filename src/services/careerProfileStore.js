const DB_NAME = 'FesaDB';
const STORE_NAME = 'careerProfile';
const PRIMARY_KEY = 'primary';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

async function getStore(mode = 'readonly') {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, mode);
  const store = transaction.objectStore(STORE_NAME);
  return { db, store };
}

export async function loadProfile() {
  try {
    const { db, store } = await getStore('readonly');
    const result = await new Promise((resolve, reject) => {
      const request = store.get(PRIMARY_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error('Failed to load profile from IndexedDB.'));
    });

    db.close();
    return result?.profile || null;
  } catch (error) {
    console.warn('Could not load profile from IndexedDB:', error);
    return null;
  }
}

export async function saveProfile(profile) {
  try {
    const { db, store } = await getStore('readwrite');
    const record = {
      id: PRIMARY_KEY,
      updatedAt: new Date().toISOString(),
      profile,
    };

    await new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error || new Error('Failed to save profile to IndexedDB.'));
    });

    db.close();
  } catch (error) {
    console.warn('Could not save profile to IndexedDB:', error);
    throw error;
  }
}