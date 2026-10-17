import { canonicalizeSkill } from './aliasMap.js';
import { getCanonicalSkillSet, containsPhrase, normalizeText } from './truthLock.js';
import {
  collectKnownEntities,
  validateTextAgainstSource,
  splitIntoSentences,
} from './claimExtraction.js';

function buildExperienceSourceText(job) {
  return [
    job.description,
    ...(Array.isArray(job.responsibilities) ? job.responsibilities : []),
    ...(Array.isArray(job.achievements) ? job.achievements : []),
    ...(Array.isArray(job.technologies) ? job.technologies : []),
    job.company,
    job.position,
    job.location,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildProjectSourceText(project) {
  return [
    project.name,
    project.description,
    ...(Array.isArray(project.technologies) ? project.technologies : []),
    ...(Array.isArray(project.achievements) ? project.achievements : []),
  ]
    .filter(Boolean)
    .join(' ');
}

function findProfileExperience(profile, company, position) {
  const normCompany = normalizeText(company);
  const normPosition = normalizeText(position);

  return (profile.experience || []).find((job) => {
    const jobCompany = normalizeText(job.company);
    const jobPosition = normalizeText(job.position);
    const companyMatch =
      jobCompany === normCompany ||
      containsPhrase(job.company, company) ||
      containsPhrase(company, job.company);
    const positionMatch =
      jobPosition === normPosition ||
      containsPhrase(job.position, position) ||
      containsPhrase(position, job.position);
    return companyMatch && positionMatch;
  });
}

function findProfileProject(profile, name) {
  return (profile.projects || []).find((p) => {
    const n = normalizeText(p.name);
    const target = normalizeText(name);
    return n === target || containsPhrase(p.name, name) || containsPhrase(name, p.name);
  });
}

function findProfileEducation(profile, institution, qualification) {
  return (profile.education || []).find((e) => {
    const instMatch =
      !institution ||
      normalizeText(e.institution) === normalizeText(institution) ||
      containsPhrase(e.institution || '', institution);
    const qualMatch =
      !qualification ||
      normalizeText(e.qualification) === normalizeText(qualification) ||
      containsPhrase(e.qualification || '', qualification);
    return instMatch && qualMatch;
  });
}

function findProfileCertification(profile, name) {
  return (profile.certifications || []).find((c) => {
    const n = normalizeText(c.name);
    const target = normalizeText(name);
    return n === target || containsPhrase(c.name || '', name) || containsPhrase(name, c.name);
  });
}

function findProfileAchievement(profile, title) {
  return (profile.achievements || []).find((a) => {
    const n = normalizeText(a.title);
    const target = normalizeText(title);
    return n === target || containsPhrase(a.title || '', title) || containsPhrase(title, a.title);
  });
}

function buildCombinedSourceText(profile) {
  return [
    profile.professionalSummary,
    ...(profile.experience || []).map((j) => buildExperienceSourceText(j)),
    ...(profile.projects || []).map((p) => buildProjectSourceText(p)),
    ...(profile.education || []).map(
      (e) => `${e.qualification || ''} ${e.fieldOfStudy || ''} ${e.institution || ''}`,
    ),
    ...Object.values(profile.skills || {}).flatMap((list) =>
      Array.isArray(list) ? list : [],
    ),
    ...(profile.certifications || []).map((c) => `${c.name || ''} ${c.issuer || ''}`),
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Validate a summary per sentence. Keeps supported sentences. Drops only the
 * offending ones. If the AI summary is missing or fully stripped, falls back
 * to the profile's own professionalSummary (already trusted user data).
 *
 * Returns { summary: string, violations: [] }.
 */
function validateSummary(resume, profile, knownEntities) {
  const violations = [];
  const combinedSource = buildCombinedSourceText(profile);

  const rawSummary =
    typeof resume.summary === 'string' ? resume.summary.trim() : '';

  if (!rawSummary) {
    // Fallback: use the user's own professionalSummary (already in the profile,
    // therefore already trusted).
    if (profile.professionalSummary && profile.professionalSummary.trim()) {
      return { summary: profile.professionalSummary.trim(), violations };
    }
    return { summary: '', violations };
  }

  const sentences = splitIntoSentences(rawSummary);
  const validSentences = [];

  for (const sentence of sentences) {
    const { supported, missing } = validateTextAgainstSource(
      sentence,
      combinedSource,
      knownEntities,
    );
    if (supported) {
      validSentences.push(sentence);
    } else {
      violations.push({
        field: 'summary',
        claim: sentence,
        reason: `Removed summary sentence with unsupported terms: ${missing.join(', ')}`,
      });
    }
  }

  const result = validSentences.join(' ').trim();

  if (result) {
    return { summary: result, violations };
  }

  // All sentences were stripped. Fall back to the profile's own summary if it
  // exists; otherwise leave the summary empty and let the user write their own.
  if (profile.professionalSummary && profile.professionalSummary.trim()) {
    return { summary: profile.professionalSummary.trim(), violations };
  }

  return { summary: '', violations };
}

export function validateResumeAgainstProfile(profile, resume, options = {}) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Career Profile is required for truth validation.');
  }
  if (!resume || typeof resume !== 'object') {
    throw new Error('Resume is required for truth validation.');
  }

  const knownEntities = collectKnownEntities(profile);
  const profileSkills = getCanonicalSkillSet(profile);
  const violations = [];

  const validated = {
    schemaVersion: 1,
    contact: {},
    summary: '',
    skillGroups: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    references: [],
    referencesIncluded: false,
    userEdited: false,
  };

  validated.contact = {
    fullName: profile.personal?.fullName || '',
    email: profile.personal?.email || '',
    phone: profile.personal?.phone || '',
    location: profile.personal?.location || '',
    links: [
      profile.personal?.linkedin,
      profile.personal?.github,
      profile.personal?.portfolio,
    ].filter(Boolean),
  };

  // Summary (per-sentence validation with profile fallback)
  const summaryResult = validateSummary(resume, profile, knownEntities);
  validated.summary = summaryResult.summary;
  violations.push(...summaryResult.violations);

  // Skills
  for (const group of resume.skillGroups || []) {
    const validItems = [];
    for (const item of group.items || []) {
      const canonical = canonicalizeSkill(item);
      if (profileSkills.has(canonical)) {
        validItems.push(item);
      } else {
        violations.push({
          field: `skillGroups.${group.label}`,
          claim: item,
          reason: 'Skill is not present in Career Profile.',
        });
      }
    }
    if (validItems.length > 0) {
      validated.skillGroups.push({ label: group.label, items: validItems });
    }
  }

  // Experience
  for (const job of resume.experience || []) {
    const source = findProfileExperience(profile, job.company, job.position);
    if (!source) {
      violations.push({
        field: 'experience',
        claim: `${job.position} at ${job.company}`,
        reason: 'Experience entry not found in Career Profile.',
      });
      continue;
    }

    const sourceText = buildExperienceSourceText(source);
    const validBullets = [];
    for (const bullet of job.bullets || []) {
      const { supported, missing } = validateTextAgainstSource(
        bullet,
        sourceText,
        knownEntities,
      );
      if (supported) {
        validBullets.push(bullet);
      } else {
        violations.push({
          field: `experience.${job.company}.bullets`,
          claim: bullet,
          reason: `Bullet introduced unsupported terms: ${missing.join(', ')}`,
        });
      }
    }

    if (
      validBullets.length === 0 &&
      (source.description || source.responsibilities?.length)
    ) {
      const fallback = [
        source.description,
        ...(source.responsibilities || []),
      ].filter(Boolean);
      validBullets.push(...fallback);
    }

    validated.experience.push({
      company: source.company,
      position: source.position,
      location: source.location,
      dates: `${source.startDate || ''}${source.startDate && source.endDate ? ' – ' : ''}${source.endDate || (source.current ? 'Present' : '')}`,
      bullets: validBullets,
    });
  }

  // Projects
  for (const project of resume.projects || []) {
    const source = findProfileProject(profile, project.name);
    if (!source) {
      violations.push({
        field: 'projects',
        claim: project.name,
        reason: 'Project not found in Career Profile.',
      });
      continue;
    }

    const sourceText = buildProjectSourceText(source);
    let description = project.description || source.description || '';
    if (description) {
      const { supported } = validateTextAgainstSource(
        description,
        sourceText,
        knownEntities,
      );
      if (!supported) description = source.description || '';
    }

    validated.projects.push({
      name: source.name,
      description,
      technologies: (source.technologies || []).slice(),
      url: source.url || '',
    });
  }

  // Education
  for (const edu of resume.education || []) {
    const source = findProfileEducation(profile, edu.institution, edu.qualification);
    if (!source) {
      violations.push({
        field: 'education',
        claim: `${edu.qualification} — ${edu.institution}`,
        reason: 'Education entry not found in Career Profile.',
      });
      continue;
    }
    validated.education.push({
      qualification: source.qualification || '',
      fieldOfStudy: source.fieldOfStudy || '',
      institution: source.institution || '',
      location: source.location || '',
      dates: `${source.startDate || ''}${source.startDate && source.endDate ? ' – ' : ''}${source.endDate || ''}`,
      description: source.description || '',
    });
  }

  // Certifications
  for (const cert of resume.certifications || []) {
    const source = findProfileCertification(profile, cert.name);
    if (!source) {
      violations.push({
        field: 'certifications',
        claim: cert.name,
        reason: 'Certification not found in Career Profile.',
      });
      continue;
    }
    validated.certifications.push({
      name: source.name || '',
      issuer: source.issuer || '',
      date: source.date || '',
      url: source.url || '',
      credentialId: source.credentialId || '',
    });
  }

  // Achievements
  for (const achievement of resume.achievements || []) {
    const source = findProfileAchievement(profile, achievement.title);
    if (!source) {
      violations.push({
        field: 'achievements',
        claim: achievement.title,
        reason: 'Achievement not found in Career Profile.',
      });
      continue;
    }
    validated.achievements.push({
      title: source.title || '',
      description: source.description || '',
      date: source.date || '',
    });
  }

  // References — copied from profile, never from AI. Preserve previous
  // referencesIncluded flag if present; otherwise default false.
  const profileReferences = Array.isArray(profile.references) ? profile.references : [];
  if (profileReferences.length > 0) {
    validated.references = profileReferences.map((r) => ({
      name: r.name || '',
      title: r.title || '',
      organization: r.organization || '',
      relationship: r.relationship || '',
      email: r.email || '',
      phone: r.phone || '',
      notes: r.notes || '',
    }));
    validated.referencesIncluded = Boolean(options.referencesIncluded);
  } else {
    validated.references = [];
    validated.referencesIncluded = false;
  }

  validated.userEdited = Boolean(options.userEdited);

  return {
    resume: validated,
    violations,
    stats: {
      violationCount: violations.length,
      cleaned: violations.length > 0,
    },
  };
}