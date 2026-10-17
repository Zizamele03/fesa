export const EMPTY_PROFILE = {
  schemaVersion: 1,
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  professionalSummary: '',
  education: [],
  experience: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
    tools: [],
    languages: [],
    queryLanguages: [],
    humanLanguages: [],
    frameworks: [],
    databases: [],
    cloud: [],
    uncertain: [],
  },
  certifications: [],
  achievements: [],
  references: [],
};

export function createEmptyProfile() {
  return JSON.parse(JSON.stringify(EMPTY_PROFILE));
}

export function createEmptyEducation() {
  return {
    institution: '',
    qualification: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

export function createEmptyExperience() {
  return {
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    responsibilities: [],
    achievements: [],
    technologies: [],
  };
}

export function createEmptyProject() {
  return {
    name: '',
    description: '',
    technologies: [],
    url: '',
    role: '',
    achievements: [],
  };
}

export function createEmptyCertification() {
  return {
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
    url: '',
  };
}

export function createEmptyAchievement() {
  return {
    title: '',
    description: '',
    date: '',
  };
}

export function createEmptyReference() {
  return {
    name: '',
    title: '',
    organization: '',
    relationship: '',
    email: '',
    phone: '',
    notes: '',
  };
}