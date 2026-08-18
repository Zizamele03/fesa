import { runTransaction, STORES } from './indexedDb.js';

const SETTINGS_ID = 'appSettings';

export async function getSettings() {
  const record = await runTransaction(STORES.SETTINGS, 'readonly', (store) =>
    store.get(SETTINGS_ID),
  );

  return record?.settings || null;
}

export async function saveSettings(settings) {
  const record = {
    id: SETTINGS_ID,
    settings,
    updatedAt: new Date().toISOString(),
  };

  await runTransaction(STORES.SETTINGS, 'readwrite', (store) =>
    store.put(record),
  );

  return settings;
}

export async function updateSettings(patch) {
  const current = (await getSettings()) || {};

  return saveSettings({
    ...current,
    ...patch,
  });
}

export async function deleteSettings() {
  await runTransaction(STORES.SETTINGS, 'readwrite', (store) =>
    store.delete(SETTINGS_ID),
  );
}