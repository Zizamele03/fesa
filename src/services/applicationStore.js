import { runTransaction, STORES } from './indexedDb.js';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function createApplication({
  company,
  jobTitle,
  jobDescription,
  jobAnalysis = null,
}) {
  const id = generateId();
  const now = new Date().toISOString();

  const record = {
    id,
    company: company || '',
    jobTitle: jobTitle || '',
    jobDescription: jobDescription || '',
    jobAnalysis,
    createdAt: now,
    updatedAt: now,
  };

  await runTransaction(STORES.APPLICATIONS, 'readwrite', (store) =>
    store.put(record),
  );

  return record;
}

export async function listApplications() {
  const records = await runTransaction(STORES.APPLICATIONS, 'readonly', (store) =>
    store.getAll(),
  );

  return (records || [])
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getApplication(id) {
  const record = await runTransaction(STORES.APPLICATIONS, 'readonly', (store) =>
    store.get(id),
  );

  if (!record) {
    throw new Error('Application not found.');
  }

  return record;
}

export async function updateApplication(id, updates) {
  const existing = await getApplication(id);

  const updatedRecord = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };

  await runTransaction(STORES.APPLICATIONS, 'readwrite', (store) =>
    store.put(updatedRecord),
  );

  return updatedRecord;
}

export async function deleteApplication(id) {
  await runTransaction(STORES.APPLICATIONS, 'readwrite', (store) =>
    store.delete(id),
  );
}