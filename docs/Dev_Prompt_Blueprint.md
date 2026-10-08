

# Phase 8 — Tailored Resume Generator
> DeepSeek implementation phase: **Phase 7**

### Goal

Generate a job-specific, ATS-friendly resume from the user's Career Profile, Job Analysis, and Match Analysis without inventing or overstating anything.

The generator must use the existing evidence and Truth Lock system rather than treating the AI as the source of truth.

### Inputs

- Career Profile
- Job Analysis
- Match Analysis
- Evidence associated with matched requirements
- User-approved profile information

### Tasks

- [ ] Design ATS-friendly resume template.
- [ ] Define resume-generation JSON/schema structure.
- [ ] Create resume-generation prompt.
- [ ] Prioritize experience relevant to the target job.
- [ ] Prioritize relevant skills based on Match Analysis.
- [ ] Select relevant projects where they provide meaningful evidence.
- [ ] Generate a professional summary based only on verified profile information.
- [ ] Rewrite experience bullets for relevance and clarity.
- [ ] Improve wording without changing factual meaning.
- [ ] Incorporate relevant job keywords naturally.
- [ ] Never invent skills, qualifications, experience, metrics, employers, projects, responsibilities, technologies, or achievements.
- [ ] Do not convert `Unverified` or `Missing` requirements into candidate facts.
- [ ] Preserve factual meaning when rewriting bullets.
- [ ] Attach source evidence to generated resume claims.
- [ ] Run generated claims through Truth Lock validation.
- [ ] Reject or remove unsupported generated claims.
- [ ] Prevent prompt injection from job descriptions from altering truth requirements.
- [ ] Display resume generation errors safely.
- [ ] Implement resume preview.
- [ ] Preserve editable generated content where practical.
- [ ] Add accept/reject suggestions if practical without weakening Truth Lock.

### Truth Requirement

Every generated factual claim must be traceable to evidence in the Career Profile.

The AI may improve wording and relevance, but it must not create new facts.

### Deliverable

A real, truthful, job-specific tailored resume that is better aligned to the target job than the original resume.

---

# Phase 9 — Cover Letter Generator
> DeepSeek implementation phase: **Phase 8**

### Goal

Generate a personalized cover letter using verified Career Profile information and the specific job context.

### Inputs

- Career Profile
- Job Analysis
- Match Analysis
- Evidence
- Company
- Job title
- User-selected length
- User-selected tone

### Tasks

- [ ] Create cover-letter schema.
- [ ] Create cover-letter generation prompt.
- [ ] Use Career Profile as the factual source.
- [ ] Use Job Analysis to identify relevant requirements and priorities.
- [ ] Use Match Analysis to identify genuine strengths.
- [ ] Use company and job title naturally.
- [ ] Reference relevant experience, skills, projects, or qualifications only where supported.
- [ ] Avoid generic filler.
- [ ] Avoid repeating the resume unnecessarily.
- [ ] Do not claim experience with missing or unverified requirements.
- [ ] Do not invent motivations, achievements, responsibilities, metrics, qualifications, or company-specific facts.
- [ ] Attach evidence to factual candidate claims.
- [ ] Run generated claims through Truth Lock.
- [ ] Reject or remove unsupported claims.
- [ ] Implement length setting.
- [ ] Implement basic tone setting.
- [ ] Implement preview.
- [ ] Allow the user to edit the generated letter.
- [ ] Prevent job-description prompt injection from overriding Fesa's truth rules.

### Deliverable

A professional, personalized, truthful cover letter that the user could realistically submit with the tailored resume.

---

# Phase 10 — Export
> DeepSeek implementation phase: **Phase 9**

### Goal

Allow users to turn generated documents into submission-ready files.

### Tasks

- [ ] Build ATS-friendly HTML resume output.
- [ ] Preserve generated content exactly between preview and export.
- [ ] Implement print styling.
- [ ] Implement PDF download.
- [ ] Build cover-letter document output.
- [ ] Implement cover-letter PDF export.
- [ ] Ensure correct page breaks.
- [ ] Ensure headings and sections do not break incorrectly.
- [ ] Handle multi-page resumes correctly.
- [ ] Handle different text lengths safely.
- [ ] Handle long company names, titles, skills, and project descriptions.
- [ ] Test exported documents in major desktop browsers.
- [ ] Test exported documents on mobile.
- [ ] Verify exported PDFs contain no missing or duplicated content.
- [ ] Verify exported PDFs remain readable and professionally formatted.
- [ ] Ensure no hidden/internal evidence metadata appears in exported documents.

### Deliverable

```text
[Download Resume PDF]

[Download Cover Letter PDF]
