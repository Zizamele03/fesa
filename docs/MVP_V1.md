# Job Application Copilot — MVP (V1) Product Specification

## 1. Product Overview

**Working name:** Job Application Copilot

The platform is an AI-powered job application assistant designed to eliminate the repetitive process of manually tailoring a resume and cover letter for every job application.

The user uploads a resume once. The system extracts and structures their professional information into a reusable **Career Profile**.

For each new job application, the user pastes the job description. The platform analyzes the job requirements against the Career Profile and generates:

- Job-match analysis
- Tailored resume
- Tailored cover letter
- Application notes/recommendations

### Core principle

> The AI may improve how the user's experience is presented, but it must never invent experience, skills, qualifications, achievements, or employment history.

---

## 2. Core Problem

Job seekers repeatedly have to:

1. Find a job.
2. Read the job description.
3. Identify requirements.
4. Open their resume.
5. Rewrite the summary.
6. Rearrange skills.
7. Rewrite experience bullets.
8. Modify projects.
9. Save a new resume.
10. Write a cover letter.
11. Modify the cover letter.
12. Repeat everything for the next application.

The platform turns this repetitive process into a reusable workflow.

---

## 3. Product Philosophy

1. **Simple** — Resume → Job Description → Application.
2. **Truthful** — Generated content must be grounded in the user's actual information.
3. **Fast** — Generate an application in minutes.
4. **Local-first** — Keep personal career information in the browser where practical.
5. **Free-first** — Target approximately R0 infrastructure cost for the MVP, excluding the domain.

---

## 4. Target Users

Primary users:

- University students
- Recent graduates
- Junior professionals
- Experienced professionals
- Active job seekers
- People applying to many positions

Initial target:

> Graduates and early-career professionals applying to multiple jobs and repeatedly modifying their CVs and cover letters.

---

## 5. MVP User Journey

```text
Upload Resume
      ↓
Extract Resume Content
      ↓
Build Career Profile
      ↓
User Reviews / Corrects Profile
      ↓
Paste Job Description
      ↓
Analyze Job
      ↓
Compare Career Profile vs Job
      ↓
Generate Match Analysis
      ↓
Generate Tailored Resume + Cover Letter
      ↓
Review / Export Application
```

---

## 6. MVP Features

### 6.1 Resume Upload

Support:

- PDF
- DOCX
- Optional TXT fallback

The original file does not need to be permanently stored on the server.

### 6.2 Resume Parsing

Extract:

- Personal information
- Education
- Experience
- Projects
- Skills
- Certifications
- Awards/achievements
- Links
- Other relevant career information

### 6.3 Career Profile

The extracted information becomes the user's reusable Career Profile.

Example:

```text
Career Profile
├── Personal
├── Education
├── Experience
├── Projects
├── Skills
├── Certifications
└── Achievements
```

The Career Profile is the **single source of truth** for AI-generated applications.

### 6.4 Career Profile Editor

The user can:

- Add
- Edit
- Delete
- Correct
- Reorder

career information.

### 6.5 Job Description Input

The user enters:

- Company
- Job title
- Job description

and clicks **Analyze Job**.

### 6.6 Job Description Analysis

Extract:

- Company
- Job title
- Location
- Education requirements
- Experience requirements
- Technical skills
- Soft skills
- Responsibilities
- Certifications
- Keywords

### 6.7 Job Match Engine

Compare:

```text
Career Profile
       VS
Job Requirements
```

Show:

- Overall match
- Technical skill match
- Education match
- Experience match
- Keyword match
- Strong matches
- Missing/unverified requirements
- Supporting evidence

Avoid presenting an unexplained "ATS score".

### 6.8 Evidence-Based Matching

Every important match should have evidence.

Example:

```text
Requirement:
REST API development

Evidence:
Database Developer Experience
→ Node.js
→ Express
→ REST API development
```

### 6.9 Truth Lock

The AI must only generate claims supported by the Career Profile.

If a job requires Kubernetes but the profile has no evidence of Kubernetes, the system must flag it as missing/unverified rather than invent experience.

### 6.10 Tailored Resume Generator

The system may modify:

- Professional summary
- Skills ordering
- Experience bullet wording
- Project selection
- Bullet ordering
- Keyword emphasis

It must not invent:

- Jobs
- Degrees
- Skills
- Certifications
- Achievements
- Technologies
- Responsibilities

### 6.11 AI Suggestions

Where practical, show:

```text
Original
AI suggestion
Why the change was made

[Accept] [Reject] [Edit]
```

The user remains in control.

### 6.12 Cover Letter Generator

Generate from:

```text
Career Profile
+
Job Description
+
Company / Position
```

The letter should be personalized and evidence-based rather than generic.

### 6.13 Application Notes

Show:

- Strongest selling points
- Potential gaps
- Suggested preparation areas

### 6.14 Application Package

Display:

```text
Company
Position
Match Score

Tailored Resume
Cover Letter
Job Analysis
Application Notes
```

### 6.15 PDF Export

V1 should prioritize clean, ATS-friendly PDF output.

DOCX export can follow shortly after the MVP.

---

## 7. Local-First Storage

V1 should avoid a database.

Use **IndexedDB** to store:

```text
careerProfile
applications
jobDescriptions
generatedContent
settings
backups
```

This reduces cost, infrastructure and privacy complexity.

### Backup / Restore

Provide:

- Export Career Profile → JSON
- Import Career Profile ← JSON

This protects users from losing their local profile if browser data is cleared.

---

## 8. Privacy Principle

The product should communicate:

> Your career profile belongs to you.

Avoid permanently storing resumes and career data on the backend unless necessary.

Only send information required for an AI operation to the AI provider.

---

## 9. Recommended Technology Stack

### Frontend

- React
- Vite
- JavaScript initially
- TypeScript later if desired

### Document processing

- PDF.js — PDF text extraction
- Mammoth.js — DOCX text extraction

### Browser storage

- IndexedDB

### Backend

- Cloudflare Workers

Responsibilities:

- Secure AI API communication
- API key protection
- Request validation
- Basic rate limiting

### Hosting

- Cloudflare Pages

### AI

Initially evaluate:

- Gemini API
- Groq
- Cloudflare Workers AI

Choose based on current free-tier availability, model quality, rate limits and privacy terms.

### Version control

- Git
- GitHub

---

## 10. V1 Architecture

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │ React + Vite    │
                  │ Frontend        │
                  └────────┬────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      ┌──────────────┐          ┌────────────────┐
      │ IndexedDB    │          │ Cloudflare     │
      │ Local Data   │          │ Worker         │
      └──────────────┘          └───────┬────────┘
                                        │
                                        ▼
                                  ┌────────────┐
                                  │ AI API     │
                                  └────────────┘
```

### Database

No database in V1.

### Authentication

No account required in V1.

### File storage

No permanent server-side file storage in V1.

---

## 11. V1 Screens

### Screen 1 — Dashboard

- Create Career Profile
- New Application
- Recent applications (if implemented)

### Screen 2 — Career Profile

Sections:

- Personal
- Education
- Experience
- Projects
- Skills
- Certifications
- Achievements

### Screen 3 — New Application

Fields:

- Company
- Job title
- Job description

### Screen 4 — Job Analysis

Show:

- Match
- Strong matches
- Gaps
- Requirements
- Evidence

### Screen 5 — Application Package

Show:

- Tailored resume
- Cover letter
- Application notes
- Export options

---

## 12. V1 AI Pipeline

### Resume extraction

```text
Resume text
↓
LLM
↓
Structured Career Profile JSON
```

### Job analysis

```text
Job description
↓
LLM
↓
Structured Job Requirements JSON
```

### Matching

```text
Career Profile
+
Job Requirements
↓
Match Analysis
```

### Resume generation

```text
Career Profile
+
Job Requirements
+
Match Analysis
↓
Tailored Resume
```

### Cover letter

```text
Career Profile
+
Job Description
+
Job Requirements
↓
Cover Letter
```

---

## 13. Structured AI Output

Use structured JSON wherever the application needs data.

Example:

```json
{
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": []
}
```

Validate AI output before displaying it.

---

## 14. V1 Scope — What NOT to Build

Do not include initially:

- Job board
- LinkedIn scraping
- Automatic job applications
- Browser extension
- Interview simulator
- AI avatar
- Payment system
- Subscription system
- Dozens of templates
- Complex analytics
- Social networking
- Recruiter dashboard
- Company database
- Automatic job discovery

---

## 15. V1 Success Criteria

The MVP is successful when a user can:

1. Upload a resume.
2. Convert it into a Career Profile.
3. Correct the profile.
4. Paste a job description.
5. Analyze the job.
6. See relevant matches and gaps.
7. Generate a tailored resume.
8. Generate a tailored cover letter.
9. Verify generated claims against their Career Profile.
10. Download the documents.
11. Save the Career Profile locally.
12. Export/import a Career Profile backup.

### Ultimate test

> Can I take a real job advertisement and produce an application I would genuinely submit?

If yes, V1 works.

---

# 16. Future Features

### V2 — Application Management

- Application history
- Application status
- Company
- Position
- Date applied
- Resume version
- Cover letter version
- Interview status
- Rejection/offer tracking

### V3 — Cloud Accounts

- Email authentication
- Google/GitHub login
- Cloud Career Profile
- Synchronization
- Multiple devices
- Cloud backups

### V4 — Advanced Career Profile

Allow users to continually add:

- Projects
- Skills
- Achievements
- Certifications
- Courses
- Work experience
- Volunteer experience
- Awards
- Publications

### V5 — Advanced Evidence System

Every generated statement can be traced back to supporting Career Profile evidence.

### V6 — Multiple Resume Versions

Examples:

- Software Developer Resume
- Data Analyst Resume
- Database Developer Resume
- Cloud Resume
- General Resume

### V7 — Job Search Assistant

Potential integrations with job boards and company career pages, subject to platform terms.

### V8 — Interview Preparation

Generate job-specific technical, behavioral and resume-based interview practice.

### V9 — Skill Gap Analysis

Compare job requirements with the user's verified skills and recommend learning priorities.

### V10 — Application Analytics

Track applications, interviews and offers and calculate metrics such as application-to-interview rate.

---

# 17. Product Positioning

Do not position the product simply as an "AI Resume Generator".

Recommended positioning:

> **An AI-powered job application assistant that turns your existing experience into a tailored application for every job — without making anything up.**

Core philosophy:

> **Your experience. Their requirements. One application.**
