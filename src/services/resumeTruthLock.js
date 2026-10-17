import { canonicalizeSkill } from './aliasMap.js';
import { getCanonicalSkillSet, containsPhrase, normalizeText } from './truthLock.js';
import {
  collectKnownEntities,
  validateTextAgainstSource,
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

export function validateResumeAgainstProfile(profile, resume) {
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

  if (resume.summary && typeof resume.summary === 'string') {
    const sources = (profile.experience || []).map((j) => buildExperienceSourceText(j));
    const projectSources = (profile.projects || []).map((p) => buildProjectSourceText(p));
    const combined = [
      profile.professionalSummary,
      ...sources,
      ...projectSources,
      ...(profile.education || []).map(
        (e) => `${e.qualification || ''} ${e.fieldOfStudy || ''} ${e.institution || ''}`,
      ),
      ...Object.values(profile.skills || {}).flatMap((list) =>
        Array.isArray(list) ? list : [],
      ),
    ]
      .filter(Boolean)
      .join(' ');

    const { supported, missing } = validateTextAgainstSource(
      resume.summary,
      combined,
      knownEntities,
    );
    if (supported) {
      validated.summary = resume.summary;
    } else {
      violations.push({
        field: 'summary',
        claim: resume.summary,
        reason: `Summary introduced unsupported terms: ${missing.join(', ')}`,
      });
    }
  }

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

  // Certifications: copy URL and credentialId from the source profile. The AI
  // cannot invent these — the truth lock enforces that the URL always comes
  // from the user's stored profile.
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

  return {
    resume: validated,
    violations,
    stats: {
      violationCount: violations.length,
      cleaned: violations.length > 0,
    },
  };
}