import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { getSafeHttpsUrl } from '../../utils/urlValidation.js';
import { getOrderedSections, getSectionLabel } from '../../utils/resumeSectionOrder.js';

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingLeft: 48,
    paddingRight: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#111111',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingBottom: 8,
    marginBottom: 14,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: '#333333',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444444',
    paddingBottom: 2,
    marginBottom: 6,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  position: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
  },
  dates: {
    fontSize: 9,
    color: '#444444',
  },
  subline: {
    fontSize: 9.5,
    color: '#333333',
    marginBottom: 3,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 10,
  },
  paragraph: {
    marginBottom: 4,
  },
  skillRow: {
    marginBottom: 2,
    fontSize: 10,
  },
  skillLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  muted: {
    fontSize: 9,
    color: '#444444',
  },
  link: {
    color: '#1f6feb',
    textDecoration: 'underline',
  },
});

function ContactLine({ contact }) {
  const bits = [
    contact?.email,
    contact?.phone,
    contact?.location,
    ...(Array.isArray(contact?.links) ? contact.links : []),
  ].filter(Boolean);

  if (bits.length === 0) return null;
  return <Text style={styles.contactLine}>{bits.join('  •  ')}</Text>;
}

function SummaryBlock({ resume }) {
  if (!resume.summary) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('summary')}
      </Text>
      <Text style={styles.paragraph}>{resume.summary}</Text>
    </View>
  );
}

function SkillsBlock({ resume }) {
  if (!resume.skillGroups.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('skills')}
      </Text>
      {resume.skillGroups.map((group, index) => (
        <Text key={index} style={styles.skillRow}>
          <Text style={styles.skillLabel}>{group.label}: </Text>
          {(group.items || []).join(', ')}
        </Text>
      ))}
    </View>
  );
}

function ExperienceBlock({ resume }) {
  if (!resume.experience.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('experience')}
      </Text>
      {resume.experience.map((job, index) => (
        <View key={index} style={styles.entry}>
          <View style={styles.entryHeader} minPresenceAhead={30}>
            <Text style={styles.position}>{job.position || ''}</Text>
            {job.dates ? <Text style={styles.dates}>{job.dates}</Text> : null}
          </View>
          {(job.company || job.location) && (
            <Text style={styles.subline}>
              {[job.company, job.location].filter(Boolean).join(' • ')}
            </Text>
          )}
          {(job.bullets || []).map((bullet, bulletIndex) => (
            <Text key={bulletIndex} style={styles.bullet}>
              • {bullet}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function EducationBlock({ resume }) {
  if (!resume.education.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('education')}
      </Text>
      {resume.education.map((edu, index) => (
        <View key={index} style={styles.entry}>
          <View style={styles.entryHeader} minPresenceAhead={30}>
            <Text style={styles.position}>
              {[edu.qualification, edu.fieldOfStudy].filter(Boolean).join(', ')}
            </Text>
            {edu.dates ? <Text style={styles.dates}>{edu.dates}</Text> : null}
          </View>
          {(edu.institution || edu.location) && (
            <Text style={styles.subline}>
              {[edu.institution, edu.location].filter(Boolean).join(' • ')}
            </Text>
          )}
          {edu.description ? (
            <Text style={styles.paragraph}>{edu.description}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ProjectsBlock({ resume }) {
  if (!resume.projects.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('projects')}
      </Text>
      {resume.projects.map((project, index) => {
        const safeUrl = getSafeHttpsUrl(project.url);
        return (
          <View key={index} style={styles.entry}>
            <Text style={styles.position} minPresenceAhead={30}>
              {project.name || ''}
            </Text>
            {project.description ? (
              <Text style={styles.paragraph}>{project.description}</Text>
            ) : null}
            {(project.technologies || []).length > 0 ? (
              <Text style={styles.muted}>
                Technologies: {project.technologies.join(', ')}
              </Text>
            ) : null}
            {safeUrl ? (
              <Link src={safeUrl} style={styles.link}>
                <Text style={styles.muted}>{safeUrl}</Text>
              </Link>
            ) : project.url ? (
              <Text style={styles.muted}>{project.url}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function CertificationsBlock({ resume }) {
  if (!resume.certifications.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('certifications')}
      </Text>
      {resume.certifications.map((cert, index) => {
        const safeUrl = getSafeHttpsUrl(cert.url);
        return (
          <Text key={index} style={styles.bullet}>
            •{' '}
            {safeUrl ? (
              <Link src={safeUrl} style={styles.link}>
                {cert.name}
              </Link>
            ) : (
              cert.name
            )}
            {cert.issuer ? ` — ${cert.issuer}` : ''}
            {cert.date ? ` (${cert.date})` : ''}
          </Text>
        );
      })}
    </View>
  );
}

function AchievementsBlock({ resume }) {
  if (!resume.achievements.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('achievements')}
      </Text>
      {resume.achievements.map((achievement, index) => (
        <View key={index} style={styles.entry}>
          <Text style={styles.position} minPresenceAhead={30}>
            {achievement.title}
            {achievement.date ? ` (${achievement.date})` : ''}
          </Text>
          {achievement.description ? (
            <Text style={styles.paragraph}>{achievement.description}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ReferencesBlock({ resume }) {
  if (!resume.referencesIncluded) return null;
  if (!resume.references || !resume.references.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {getSectionLabel('references')}
      </Text>
      {resume.references.map((ref, index) => (
        <View key={index} style={styles.entry}>
          <Text style={styles.position} minPresenceAhead={30}>
            {ref.name || ''}
          </Text>
          {(ref.title || ref.organization) && (
            <Text style={styles.subline}>
              {[ref.title, ref.organization].filter(Boolean).join(' • ')}
            </Text>
          )}
          {ref.relationship ? (
            <Text style={styles.muted}>Relationship: {ref.relationship}</Text>
          ) : null}
          {ref.email ? <Text style={styles.muted}>Email: {ref.email}</Text> : null}
          {ref.phone ? <Text style={styles.muted}>Phone: {ref.phone}</Text> : null}
          {ref.notes ? <Text style={styles.muted}>{ref.notes}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const SECTION_BLOCKS = {
  summary: SummaryBlock,
  skills: SkillsBlock,
  experience: ExperienceBlock,
  education: EducationBlock,
  projects: ProjectsBlock,
  certifications: CertificationsBlock,
  achievements: AchievementsBlock,
  references: ReferencesBlock,
};

export default function ResumeDocument({ resume, profile }) {
  if (!resume || typeof resume !== 'object') return null;

  const { contact = {} } = resume;
  const orderedSections = getOrderedSections(resume, profile);

  return (
    <Document
      title={contact.fullName ? `${contact.fullName} — Resume` : 'Resume'}
      author={contact.fullName || undefined}
      creator="Fesa"
      producer="Fesa"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          {contact.fullName ? (
            <Text style={styles.name}>{contact.fullName}</Text>
          ) : null}
          <ContactLine contact={contact} />
        </View>

        {orderedSections.map((section) => {
          const Block = SECTION_BLOCKS[section];
          return Block ? <Block key={section} resume={resume} /> : null;
        })}
      </Page>
    </Document>
  );
}