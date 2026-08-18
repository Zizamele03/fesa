import { normalizeImportedProfile } from '../utils/importedProfileValidator.js';

export function exportProfile(profile) {
  if (!profile) {
    throw new Error('No Career Profile available to export.');
  }

  const payload = {
    schemaVersion: profile.schemaVersion || 1,
    exportedAt: new Date().toISOString(),
    profile,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fesa-career-profile.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importProfileFromFile(file) {
  if (!file) {
    throw new Error('Please choose a JSON file to import.');
  }

  const text = await file.text();

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Selected file is not valid JSON.');
  }

  return normalizeImportedProfile(parsed);
}