import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import CoverLetterPreview from '../components/CoverLetterPreview.jsx';
import {
  applicationPackage,
  careerProfile,
} from '../data/demoData.js';

export default function ApplicationPackage() {
  const { company, jobTitle } = applicationPackage;

  return (
    <div>
      <PageHeader
        title="Application Package"
        description={`Tailored materials for ${jobTitle} at ${company}`}
        actions={
          <>
            <Button>Download Resume</Button>
            <Button variant="secondary">Download Cover Letter</Button>
          </>
        }
      />

      <div className="package-actions">
        <Button variant="ghost" size="sm">
          Edit Resume
        </Button>
        <Button variant="ghost" size="sm">
          Edit Cover Letter
        </Button>
        <Button variant="ghost" size="sm">
          Regenerate
        </Button>
      </div>

      <section className="page-section">
        <h2>Tailored Resume</h2>
        <ResumePreview
          profile={careerProfile}
          company={company}
          jobTitle={jobTitle}
        />
      </section>

      <section className="page-section">
        <h2>Cover Letter</h2>
        <CoverLetterPreview
          candidate={careerProfile.personalInformation}
          company={company}
          jobTitle={jobTitle}
          paragraphs={applicationPackage.coverLetterBody}
        />
      </section>

      <section className="page-section">
        <h2>Application Notes</h2>
        <ul className="notes-list">
          {applicationPackage.applicationNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}