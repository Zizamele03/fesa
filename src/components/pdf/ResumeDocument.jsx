import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

export default function ResumeDocument({ resume }) {
  if (!resume || typeof resume !== 'object') return null;

  const {
    contact = {},
    summary,
    skillGroups = [],
    experience = [],
    projects = [],
    education = [],
    certifications = [],
    achievements = [],
  } = resume;

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

        {summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Professional Summary
            </Text>
            <Text style={styles.paragraph}>{summary}</Text>
          </View>
        ) : null}

        {skillGroups.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Skills
            </Text>
            {skillGroups.map((group, index) => (
              <Text key={index} style={styles.skillRow}>
                <Text style={styles.skillLabel}>{group.label}: </Text>
                {(group.items || []).join(', ')}
              </Text>
            ))}
          </View>
        ) : null}

        {experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Professional Experience
            </Text>
            {experience.map((job, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader} minPresenceAhead={30}>
                  <Text style={styles.position}>{job.position || ''}</Text>
                  {job.dates ? (
                    <Text style={styles.dates}>{job.dates}</Text>
                  ) : null}
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
        ) : null}

        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Projects
            </Text>
            {projects.map((project, index) => (
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
                {project.url ? (
                  <Text style={styles.muted}>{project.url}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Education
            </Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader} minPresenceAhead={30}>
                  <Text style={styles.position}>
                    {[edu.qualification, edu.fieldOfStudy]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                  {edu.dates ? (
                    <Text style={styles.dates}>{edu.dates}</Text>
                  ) : null}
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
        ) : null}

        {certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Certifications
            </Text>
            {certifications.map((cert, index) => (
              <Text key={index} style={styles.bullet}>
                •{' '}
                {[cert.name, cert.issuer, cert.date].filter(Boolean).join(' — ')}
              </Text>
            ))}
          </View>
        ) : null}

        {achievements.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={40}>
              Achievements
            </Text>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.position} minPresenceAhead={30}>
                  {achievement.title}
                  {achievement.date ? ` (${achievement.date})` : ''}
                </Text>
                {achievement.description ? (
                  <Text style={styles.paragraph}>
                    {achievement.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}