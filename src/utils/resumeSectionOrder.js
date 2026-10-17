/**
 * Determine the render order for resume sections based on the resume content
 * and the candidate's career stage.
 *
 * Rules:
 *  - No work-experience entries in the profile → early-career layout
 *    (Education and Projects lead, because that is where their evidence lives).
 *  - Otherwise → standard professional layout (Skills and Experience lead).
 *
 * Both the on-screen preview and the PDF export use this same helper so the
 * two stay in sync.
 */

const STANDARD_ORDER = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
  'achievements',
  'references',
];

const EARLY_CAREER_ORDER = [
  'summary',
  'education',
  'projects',
  'skills',
  'experience',
  'certifications',
  'achievements',
  'references',
];

function isEarlyCareer(resume, profile) {
  const experienceEntries =
    (profile && Array.isArray(profile.experience) && profile.experience.length) ||
    (resume && Array.isArray(resume.experience) && resume.experience.length) ||
    0;

  return experienceEntries === 0;
}

export function getOrderedSections(resume, profile) {
  if (!resume) return [];

  const available = new Set();

  if (resume.summary) available.add('summary');
  if (Array.isArray(resume.skillGroups) && resume.skillGroups.length > 0) {
    available.add('skills');
  }
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    available.add('experience');
  }
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    available.add('education');
  }
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    available.add('projects');
  }
  if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    available.add('certifications');
  }
  if (Array.isArray(resume.achievements) && resume.achievements.length > 0) {
    available.add('achievements');
  }
  if (
    resume.referencesIncluded &&
    Array.isArray(resume.references) &&
    resume.references.length > 0
  ) {
    available.add('references');
  }

  const baseOrder = isEarlyCareer(resume, profile)
    ? EARLY_CAREER_ORDER
    : STANDARD_ORDER;

  return baseOrder.filter((section) => available.has(section));
}

export function getSectionLabel(section) {
  const labels = {
    summary: 'Professional Summary',
    skills: 'Skills',
    experience: 'Professional Experience',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    achievements: 'Achievements',
    references: 'References',
  };
  return labels[section] || section;
}