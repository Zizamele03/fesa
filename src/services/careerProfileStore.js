import { runTransaction, STORES } from './indexedDb.js';

const CAREER_PROFILE_ID = 'current';

export async function loadProfile() {
  try {
    const record = await runTransaction(
      STORES.CAREER_PROFILE,
      'readonly',
      (store) => store.get(CAREER_PROFILE_ID),
    );

    return record?.profile || null;
  } catch (error) {
    console.warn('Could not load profile from IndexedDB:', error);
    return null;
  }
}

export async function saveProfile(profile) {
  const record = {
    id: CAREER_PROFILE_ID,
    schemaVersion: profile.schemaVersion || 1,
    updatedAt: new Date().toISOString(),
    profile,
  };

  await runTransaction(STORES.CAREER_PROFILE, 'readwrite', (store) =>
    store.put(record),
  );

  return record;
}

export async function deleteProfile() {
  await runTransaction(STORES.CAREER_PROFILE, 'readwrite', (store) =>
    store.delete(CAREER_PROFILE_ID),
  );
}