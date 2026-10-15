import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 60,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#111111',
  },
  greeting: {
    marginBottom: 14,
  },
  paragraph: {
    marginBottom: 12,
  },
  signoff: {
    marginTop: 20,
  },
  signoffLine: {
    marginBottom: 0,
  },
});

export default function CoverLetterDocument({ coverLetter }) {
  if (!coverLetter || typeof coverLetter !== 'object') return null;

  const { greeting, opening, body = [], closing, signoff } = coverLetter;

  const signoffLines = signoff ? String(signoff).split('\n') : [];

  return (
    <Document title="Cover Letter" creator="Fesa" producer="Fesa">
      <Page size="A4" style={styles.page} wrap>
        {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}

        {opening ? <Text style={styles.paragraph}>{opening}</Text> : null}

        {(body || []).map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        {closing ? <Text style={styles.paragraph}>{closing}</Text> : null}

        {signoffLines.length > 0 ? (
          <View style={styles.signoff}>
            {signoffLines.map((line, index) => (
              <Text key={index} style={styles.signoffLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}