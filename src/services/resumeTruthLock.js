import { canonicalizeSkill } from './aliasMap.js';
import {
  getCanonicalSkillSet,
  getProfileTextSources,
  containsPhrase,
  normalizeText,
} from './truthLock.js';

const GENERAL_STOPWORDS = new Set([
  'the','and','for','with','using','from','into','that','this','which',
  'our','their','they','was','were','has','have','had','did','done',
  'doing','will','would','should','could','can','may','might','must',
  'about','across','within','during','after','before','between','under',
  'over','through','also','plus','or','but','not','all','any','some',
  'more','most','such','only','just','very','well','into','onto',
  'upon','than','then','when','where','why','how','what','who','whom',
  'these','those','them','its','it','is','are','am','be','been','being',
  'do','does','to','of','in','on','at','by','so','if','as','an','a',
  'i','me','my','we','us','you','your','new','current','various',
  'several','multiple','other','another','same','each','every',
]);

function collectKnownEntities(profile) {
  const entities = new Set();

  const add = (value) => {
    const str = String(value || '').trim();
    if (str.length >= 3 && !GENERAL_STOPWORDS.has(str.toLowerCase())) {
      entities.add(str.toLowerCase());
    }
  };

  const skills = getCanonicalSkillSet(profile);
  for (const skill of skills) add(skill);

  for (const list of Object.values(profile.skills || {})) {
    for (const skill of Array.isArray(list) ? list : []) add(skill);
  }

  for (const job of profile.experience || []) {
    add(job.company);
    add(job.position);
    for (const tech of job.technologies || []) add(tech);
  }

  for (const project of profile.projects || []) {
    add(project.name);
    for (const tech of project.technologies || []) add(tech);
  }

  for (const edu of profile.education || []) {
    add(edu.institution);
  }

  for (const cert of profile.certifications || []) {
    add(cert.name);
    add(cert.issuer);
  }

  return entities;
}

function extractKeyTerms(text, knownEntities) {
  const terms = new Set();
  const raw = String(text || '');

  const numbers = raw.match(/\d+[%+kKmM]?/g) || [];
  for (const n of numbers) terms.add(n.toLowerCase());

  for (const entity of knownEntities) {
    if (containsPhrase(raw, entity)) terms.add(entity);
  }

  const words = raw.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    const clean = words[i].replace(/[^A-Za-z0-9+#-]/g, '');
    if (!clean || clean.length < 2) continue;
    if (i === 0) continue;
    if (/^[A-Z]/.test(clean) && !GENERAL_STOPWORDS.has(clean.toLowerCase())) {
      terms.add(clean.toLowerCase());
    }
  }

  return terms;
}

function validateTextAgainstSource(text, sourceText, knownEntities) {
  const terms = extractKeyTerms(text, knownEntities);
  const missing = [];

  for (const term of terms) {
    if (!containsPhrase(sourceText, term)) missing.push(term);
  }

  return { supported: missing.length === 0, missing };
}

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
    contact: { ...resume.contact },
    summary: '',
    skillGroups: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
  };

  // Contact — trust profile values
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

  // Summary — token-level check against full profile text
  if (resume.summary && typeof resume.summary === 'string') {
    const allSources = getProfileTextSources(profile);
    const combined = allSources.map((s) => s.text).join(' ');
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

  // Skills — must exist in profile
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

  // Experience — must exist in profile; bullets validated against source
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

    if (validBullets.length === 0 && (source.description || source.responsibilities?.length)) {
      // Fallback: use original responsibilities unchanged
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

  // Projects — must exist in profile
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
      const { supported } = validateTextAgainstSource(description, sourceText, knownEntities);
      if (!supported) description = source.description || '';
    }

    validated.projects.push({
      name: source.name,
      description,
      technologies: (source.technologies || []).slice(),
      url: source.url || '',
    });
  }

  // Education — must exist in profile
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

  // Certifications — must exist in profile
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
    });
  }

  // Achievements — must exist in profile
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