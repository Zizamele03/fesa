import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import FormField from '../components/FormField.jsx';

export default function NewApplication() {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/job-analysis');
  };

  return (
    <div>
      <PageHeader
        title="New Application"
        description="Enter the job details you want to apply for. Fesa will later analyze the role against your Career Profile."
      />

      <Card className="form-card">
        <form onSubmit={handleSubmit}>
          <FormField label="Company Name" htmlFor="companyName" required>
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="e.g. Northwind Labs"
              autoComplete="organization"
              required
            />
          </FormField>

          <FormField label="Job Title" htmlFor="jobTitle" required>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="e.g. Frontend Engineer"
              autoComplete="off"
              required
            />
          </FormField>

          <FormField
            label="Job Description"
            htmlFor="jobDescription"
            required
            hint="Paste the full job description. Fesa will use this to tailor your application in a later phase."
          >
            <textarea
              id="jobDescription"
              name="jobDescription"
              rows={12}
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste job description here..."
              required
            />
          </FormField>

          <div className="form-actions">
            <Button type="submit" size="lg">
              Analyze Job
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}