function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function normalizeGeneratedResume(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid resume object returned from AI.');
  }

  const obj = asObject(raw);

  const normalized = {
    schemaVersion: 1,
    contact: {
      fullName: asString(asObject(obj.contact).fullName),
      email: asString(asObject(obj.contact).email),
      phone: asString(asObject(obj.contact).phone),
      location: asString(asObject(obj.contact).location),
      links: asArray(asObject(obj.contact).links).map((l) => asString(l)).filter(Boolean),
    },
    summary: asString(obj.summary),
    skillGroups: asArray(obj.skillGroups).map((group) => ({
      label: asString(asObject(group).label),
      items: asArray(asObject(group).items).map((i) => asString(i)).filter(Boolean),
    })).filter((g) => g.label && g.items.length > 0),
    experience: asArray(obj.experience).map((job) => ({
      company: asString(asObject(job).company),
      position: asString(asObject(job).position),
      location: asString(asObject(job).location),
      dates: asString(asObject(job).dates),
      bullets: asArray(asObject(job).bullets).map((b) => asString(b)).filter(Boolean),
    })).filter((j) => j.company || j.position),
    projects: asArray(obj.projects).map((p) => ({
      name: asString(asObject(p).name),
      description: asString(asObject(p).description),
      technologies: asArray(asObject(p).technologies).map((t) => asString(t)).filter(Boolean),
      url: asString(asObject(p).url),
    })).filter((p) => p.name),
    education: asArray(obj.education).map((e) => ({
      qualification: asString(asObject(e).qualification),
      fieldOfStudy: asString(asObject(e).fieldOfStudy),
      institution: asString(asObject(e).institution),
      location: asString(asObject(e).location),
      dates: asString(asObject(e).dates),
      description: asString(asObject(e).description),
    })).filter((e) => e.institution || e.qualification),
    certifications: asArray(obj.certifications).map((c) => ({
      name: asString(asObject(c).name),
      issuer: asString(asObject(c).issuer),
      date: asString(asObject(c).date),
    })).filter((c) => c.name),
    achievements: asArray(obj.achievements).map((a) => ({
      title: asString(asObject(a).title),
      description: asString(asObject(a).description),
      date: asString(asObject(a).date),
    })).filter((a) => a.title),
  };

  const hasContent =
    normalized.contact.fullName ||
    normalized.summary ||
    normalized.skillGroups.length > 0 ||
    normalized.experience.length > 0 ||
    normalized.education.length > 0;

  if (!hasContent) {
    throw new Error('AI returned an empty resume.');
  }

  return normalized;
}