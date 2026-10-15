# Fesa Fine-Tuning Roadmap

## MVP Reliability, Match Accuracy, Resume Editing, and Profile Quality

**Purpose:** A controlled roadmap for creating one DeepSeek
implementation prompt per phase. Stabilize existing behavior first, make
incremental changes, and test every phase before proceeding.

## Product principles

1.  Never invent candidate facts: skills, qualifications, experience,
    achievements, dates, metrics, certifications, or links.
2.  AI may suggest semantic relationships; evidence and explicit rules
    determine final match classifications.
3.  A skill appearing in a job advertisement is not evidence that the
    candidate possesses it.
4.  Keep spoken languages, programming languages, tools, frameworks,
    certifications, qualifications, and other categories distinct.
5.  Support all industries, qualification levels, career stages, and
    candidates with no formal qualifications.
6.  Preserve user edits, generated documents, saved applications, and
    exports.
7.  Treat uploaded resumes, job descriptions, URLs, and AI output as
    untrusted input.
8.  Prefer an honest "Unverified" result over an unsupported "Matched"
    result.

## Phase overview

  -------------------------------------------------------------------------
  Fine-tuning phase                   DeepSeek phase Outcome
  --------------------- ---------------------------- ----------------------
  A. Baseline Audit and                            1 Understand the
  Regression Protection                              codebase and establish
                                                     test baseline

  B. Career Profile                                2 Correct extraction
  Extraction Accuracy                                categories and
                                                     language confusion

  C. Certification                                 3 Store certification
  Links and Verified                                 URLs and link
  Credentials                                        credential names in
                                                     resumes

  D. Resume                                        4 Fix missing summaries
  Completeness and                                   and let users edit
  Editing                                            resumes

  E. AI-Assisted                                   5 Improve alias and
  Cross-Industry Match                               semantic matching
  Analysis                                           while retaining
                                                     evidence safeguards

  F. Missing-Skill                                 6 Let users review and
  Review Modal                                       deliberately approve
                                                     application-specific
                                                     skill additions

  G. End-to-End                                    7 Test the complete
  Reliability and MVP                                workflow and prepare
  Readiness                                          for controlled beta
  -------------------------------------------------------------------------

Complete each phase and its acceptance checks before starting the next.
Adjust the order only if the audit identifies a genuine dependency, and
document the reason.

------------------------------------------------------------------------

# Phase A --- Baseline Audit and Regression Protection

**DeepSeek implementation phase: 1**

### Goal

Understand the actual implementation before modifying it.

### Tasks

-   Inspect the repository, architecture, schemas, prompts, API routes,
    services, components, storage, dependencies, and tests.
-   Trace the full workflow: upload → profile extraction/editing/storage
    → job analysis → match analysis → resume generation/editing →
    cover-letter generation/editing → PDF export.
-   Locate where the resume summary is generated, validated, previewed,
    persisted, edited, and exported.
-   Locate profile language/skill categories, certification fields,
    match classifications/evidence, and document storage.
-   Run existing tests, lint, and production build before changes;
    record actual results.
-   List observed defects separately from assumptions.
-   Add only focused baseline regression tests where safe.

### Constraints

This phase is inspection and baseline testing, not a redesign. Do not
implement later phases, invent schemas, or refactor unrelated code.

### Acceptance criteria

A concise architecture map, prioritized defect list, baseline test
report, and phase plan exist. Existing functionality remains unchanged.

------------------------------------------------------------------------

# Phase B --- Career Profile Extraction Accuracy

**DeepSeek implementation phase: 2**

### Goal

Improve the accuracy of structured profile extraction, especially spoken
languages versus programming languages.

### Tasks

-   Inspect and improve the current extraction prompt, schema, parsing,
    normalization, and validation.
-   Separate human/spoken/sign languages from programming/query
    languages.
-   Do not use a closed list of examples. Use context to classify terms;
    the same word can mean different things in different contexts.
-   Keep tools, frameworks, platforms, methodologies, soft skills,
    certifications, qualifications, work history, projects, and other
    sections distinct where supported by the existing schema.
-   Preserve source meaning and, where practical, traceability to the
    original resume text.
-   If classification is ambiguous, flag it for review instead of
    silently assigning a potentially wrong category.
-   Never fill missing sections with invented information or treat
    job-post content as profile evidence.
-   Do not unexpectedly overwrite user edits during re-extraction.
-   Validate structured AI output and handle malformed responses, long
    documents, empty/scanned resumes, duplicate entries, and provider
    failures.
-   Keep API keys server-side and uploaded content treated as untrusted
    input.

### Test cases

-   Spoken languages only; programming languages only; both together.
-   Java versus JavaScript and other similar terms.
-   Non-technical resumes, multiple certifications, no formal
    qualifications, ambiguous formatting, and malformed AI output.

### Acceptance criteria

Spoken and programming languages are correctly separated; uncertain
classifications are reviewable; no facts are fabricated; profile
editing, persistence, import/export, and downstream generation still
work.

------------------------------------------------------------------------

# Phase C --- Certification Links and Verified Credentials

**DeepSeek implementation phase: 3**

### Goal

Let users store a link per certification and embed that link in the
certification name on the generated resume.

### Tasks

-   Inspect the actual certification schema and every relevant
    profile-editor, storage, import/export, generation, preview, and
    PDF-export path.
-   Add a URL field only if one does not already exist; follow existing
    schema/version conventions.
-   Allow users to add, edit, remove, and save each certification link.
    A URL must remain optional.
-   Validate URL syntax and permit only explicitly supported safe web
    protocols (normally HTTPS; HTTP only if deliberately supported).
    Reject `javascript:`, `data:`, and other unsafe protocols.
-   Preserve each URL with the correct certification through persistence
    and import/export.
-   Make the certification name clickable in resume preview and PDF when
    a valid URL is supplied and the export method supports links.
-   Without a URL, render the certification name as ordinary text.
-   Never guess URLs or claim the certificate was verified if it was
    not.
-   Preserve existing profiles and certifications.

### Acceptance criteria

Each certification can have its own optional safe URL; links survive
save/reload/import/export and appear on the correct certification name
in resume output. Existing records remain compatible.

------------------------------------------------------------------------

# Phase D --- Resume Completeness and Editing

**DeepSeek implementation phase: 4**

### Part 1: Fix the missing summary

-   Trace summary generation through schema validation, preview,
    persistence, editing, and PDF export.
-   Fix the underlying cause; do not merely add a hardcoded placeholder.
-   Make the summary an explicit validated field if consistent with the
    actual resume schema.
-   Generate a relevant summary only from supported Career Profile
    evidence and job context.
-   If evidence is insufficient, do not fabricate a summary. Provide a
    clear empty state and allow the user to write one or follow the
    existing safe fallback.
-   Prevent summaries from disappearing, duplicating, or being
    overwritten unexpectedly.
-   Add regression tests for generation, preview, persistence, editing,
    and export.

### Part 2: Add resume editing

-   Inspect the existing cover-letter editing flow and reuse suitable
    patterns.
-   Let users edit the tailored resume's supported sections, including
    summary, skills, work history, education, projects, and
    certifications.
-   Support editing structured entries without exposing raw internal
    JSON or evidence metadata.
-   Preserve edits using existing storage conventions and export the
    latest approved version.
-   If regeneration would overwrite user edits, warn the user and
    require an intentional action.
-   Do not let editing or saving bypass factual safeguards. A user edit
    is not independent verification by Fesa.
-   Keep the UI responsive, accessible, and clear about save/error
    states.

### Test cases

Missing/valid/short-evidence summaries; editing multiple sections;
navigating away and back; regeneration after edits; long text; PDF
export; existing cover-letter editing and saved applications.

### Acceptance criteria

The summary reliably appears when supportable, unsupported facts are not
invented, the resume is editable, and preview, persistence, and PDF
export reflect the latest edits.

------------------------------------------------------------------------

# Phase E --- AI-Assisted Cross-Industry Match Analysis

**DeepSeek implementation phase: 5**

### Goal

Use AI to improve recognition of aliases, alternate terminology,
abbreviations, equivalent terms, and contextual relationships across
industries---without allowing AI to invent evidence or decide final
factual matches on its own.

### Required architecture

1.  Run existing deterministic normalization and exact/boundary
    matching.
2.  Apply curated aliases and context-aware rules where appropriate.
3.  Ask AI for optional semantic relationship suggestions.
4.  Validate suggestions against actual profile evidence.
5.  Apply the existing classification rules and produce evidence-based
    results.
6.  Explain classifications and uncertainty.

### Tasks

-   Audit the existing Match Engine, Truth Lock/claim validator,
    evidence model, and tests before modifying anything.
-   Preserve exact matching and protections against false matches,
    including substring confusion such as Java versus JavaScript.
-   Use AI to suggest aliases, abbreviations, equivalent terminology,
    related skills, transferable capabilities, and industry-specific
    phrasing.
-   Keep the approach domain-agnostic, not IT-only.
-   Require schema-validated AI responses and handle malformed output,
    timeouts, quota limits, and provider outages.
-   Use the existing server-side AI provider abstraction. Do not expose
    keys or duplicate provider logic.
-   Treat resumes and job descriptions as untrusted data; resist prompt
    injection.
-   Keep deterministic matching operational if AI is unavailable.
-   Preserve required/preferred distinctions.
-   Keep skills, experience duration, qualifications, licences, and
    certifications distinct. Never infer years of experience or
    qualification equivalence from semantic similarity alone.
-   A related skill must not automatically become an exact match.
-   Use existing product labels where possible:
    -   **Matched:** direct evidence supports the requirement.
    -   **Related:** evidence supports a related capability, not
        necessarily an equivalent one.
    -   **Partial:** some but not all aspects are evidenced.
    -   **Missing:** available profile evidence does not show the
        requirement.
    -   **Unverified:** evidence is ambiguous or insufficient to decide
        safely.
-   Add tests for positive and negative semantic matches, ambiguity, AI
    failure fallback, and adversarial job descriptions.

### Test cases

Exact matches, aliases, abbreviations, related-but-not-equivalent
technologies, ambiguous words, cross-industry terminology, required
versus preferred items, missing evidence, no formal qualifications,
prompt injection, malformed responses, provider outages, and
false-positive boundary cases.

### Acceptance criteria

AI improves terminology coverage, but final classifications remain
evidence-grounded. Uncertainty is visible, related skills are not
overstated, and deterministic matching still works during AI failure.

------------------------------------------------------------------------

# Phase F --- Missing-Skill Review Modal

**DeepSeek implementation phase: 6**

### Goal

Implement an original Fesa review flow inspired by the skill-review
interaction the user likes in JobMail. Show job requirements missing or
not clearly supported by the profile, and let users deliberately select
only skills they genuinely possess for the tailored resume.

### Critical rule

**A skill in the job advertisement is not evidence that the candidate
possesses it. Never auto-add missing skills.**

### Desired flow

1.  User runs Match Analysis.
2.  Fesa identifies relevant missing, related, or unverified
    requirements.
3.  A modal/review step shows the requirement, relevant job-post
    wording, status, and explanation.
4.  The user can confirm they genuinely have the skill, indicate related
    experience if supported, skip it, or leave it unverified.
5.  Where useful, ask for honest context, such as the project or role in
    which they used the skill.
6.  Only deliberately approved items may influence that application's
    tailored resume.
7.  Run the relevant claim/evidence validation before export.
8.  Let the user review, change, and undo selections.

### Tasks

-   Inspect Match Analysis, resume generation inputs, Truth Lock,
    application persistence, and existing UI patterns.
-   Reuse existing data structures where possible; do not create a
    second source of truth.
-   Keep application-specific confirmations attached to the correct
    application. Do not silently add them to the permanent Career
    Profile.
-   Never preselect missing skills.
-   Make clear that a confirmation is the user's attestation, not
    independent verification by Fesa.
-   Do not turn a selected skill into invented work history, dates,
    projects, achievements, certificates, or years of experience.
-   A skill confirmed without supporting context must not be described
    as independently verified experience.
-   Distinguish missing from related and unverified; do not present
    every missing keyword as something the user should add.
-   Handle stale analysis, profile changes, job-analysis changes,
    regeneration, cancellation, and repeated opening.
-   Provide accessible keyboard/focus behavior and responsive mobile
    layout.
-   Exclude internal modal state, evidence IDs, and review metadata from
    exported documents.

### Suggested UI wording

"These requirements appear in the job posting but are not clearly
supported by your profile."

For each requirement, show the job-post context, current classification,
a genuine-possession confirmation, optional experience context, and
skip/continue controls. Avoid shaming language or implying that adding
more keywords is always better.

### Acceptance criteria

Users can review and approve only genuine skills; missing skills are
never automatically added; selections are application-specific and
reversible; Truth Lock remains active; exported documents contain only
approved resume content.

------------------------------------------------------------------------

# Phase G --- End-to-End Reliability and MVP Readiness

**DeepSeek implementation phase: 7**

### Goal

Validate that all fine-tuned features work together, close the remaining
MVP launch blockers, polish the existing UI/CSS, and prepare for a
controlled beta. Keep this as the final phase: do not create a separate
CSS phase unless the audit proves that the styling work has independent
technical dependencies.

### 1. End-to-end product reliability

### Test across these candidate/job scenarios

-   Software Developer.
-   Database Developer.
-   Data Analyst.
-   IT Graduate.
-   Cloud/infrastructure role.
-   Non-technical professional.
-   Graduate with limited experience.
-   Role requiring formal qualifications.
-   Role valuing practical experience.
-   Candidate with no formal qualifications.
-   Career changer.
-   Candidate applying outside their previous industry.

### 2. Core MVP workflow and data safety

-   A first-time user can understand the next step without instructions.
-   Users can see saved applications, reopen one, and continue editing it.
-   Profile and application data survive refreshes and browser restarts
    under the existing local-storage design.
-   Users can intentionally delete an individual application and access
    a clear way to delete their profile/application data from this browser.
-   Save, loading, empty, success, and error states are clear and do not
    falsely imply that an operation succeeded.
-   Failed AI requests, timeouts, quota/rate limits, malformed responses,
    and offline/provider failures show useful recovery guidance. Do not
    silently switch to a weaker or materially different generation path.
-   Warn users before regeneration or destructive actions could replace
    their edits. Do not silently discard unsaved changes.
-   Add a short, understandable privacy notice that explains what stays
    in the browser, what is sent to the AI provider/server, and what users
    should avoid uploading. Do not claim browser storage is encrypted or
    cloud-backed unless that is actually true.
-   Keep API credentials server-side; check request limits, upload
    validation, safe URL handling, output escaping, and prompt-injection
    defenses.
-   Provide a simple feedback/error-reporting route if practical. Do not
    include CVs, cover letters, job descriptions, API keys, or other
    sensitive content in diagnostic logs by default.

### 3. Document quality and truthful output

-   Resume and cover-letter preview reflects the latest saved/approved
    content.
-   PDF exports reflect the latest edited content, include supported
    certification hyperlinks, and contain no internal evidence metadata.
-   Check page breaks, headings, bullets, long text, multi-page content,
    selectable text, and links in actual exported PDFs.
-   Include a final pre-export review for obvious missing sections,
    unreviewed claims, formatting issues, or stale content where it fits
    the current UI without creating a confusing extra workflow.
-   Ensure generated content never claims a missing skill, qualification,
    achievement, metric, employer, date, or duration without candidate
    evidence or explicit user-provided information.

### 4. CSS and UI polish

-   Inspect the existing styles and design patterns first; polish the
    current UI instead of redesigning the application or introducing a
    new design system.
-   Make spacing, typography, alignment, buttons, form fields, cards,
    modals, badges, alerts, navigation, and document previews consistent.
-   Establish a clear visual hierarchy and readable line lengths.
-   Check loading, empty, success, warning, validation, and error states
    for consistent styling.
-   Ensure resume editing and the missing-skill modal are usable on
    desktop, tablet, and narrow mobile widths.
-   Fix horizontal overflow, clipped content, overlapping controls,
    inconsistent margins, and awkward wrapping.
-   Add visible keyboard focus, adequate contrast, sensible hover/disabled
    states, and accessible labels. Do not rely on color alone to convey
    match status or errors.
-   Keep the design professional, lightweight, and suitable for users
    across industries and qualification levels.
-   Avoid decorative effects, large animations, unnecessary dependencies,
    and CSS duplication. Do not break existing behavior to achieve a
    visual change.
-   Compare key screens before and after when possible, and report which
    viewport sizes were actually checked.

### 5. End-to-end checks

-   Resume upload and PDF/DOCX extraction.
-   Profile extraction, category accuracy, and spoken/programming
    language separation.
-   Profile editing, persistence, import/export.
-   Certification URL editing, storage, preview, and PDF links.
-   Job analysis and required/preferred separation.
-   AI-assisted Match Analysis and deterministic fallback.
-   Evidence-based classifications and Truth Lock.
-   Missing-skill modal, confirmation, undo, and application isolation.
-   Summary generation and resume editing.
-   Cover-letter editing.
-   PDF fidelity, pagination, long text, and no missing/duplicated
    content.
-   Application save/reopen/update/delete.
-   Provider outage, quota limits, malformed inputs, and prompt
    injection.
-   Unsafe URLs, privacy, secrets, responsive UI, and accessibility.
-   No internal evidence or validation metadata in exported files.

### Acceptance criteria

-   Run automated tests, lint, and production build; report actual
    results.
-   Test actual PDF output, including text extraction, hyperlinks, and
    short/long multi-page documents.
-   Complete a manual end-to-end run from resume upload through job
    analysis, matching, missing-skill review, document editing, saving,
    reopening, and PDF export.
-   Test browser/device sizes where available and state exactly what
    could not be tested.
-   Confirm users can find saved applications and deliberately delete
    their local data.
-   Confirm privacy wording matches the actual data flow and no secrets
    or sensitive document content are exposed in logs.
-   Confirm CSS polish has not introduced functional or accessibility
    regressions.
-   Fix critical and high-impact regressions before declaring beta
    readiness; record lower-priority limitations honestly.
-   Run a private beta with approximately 5–10 testers with varied
    industries, experience levels, and qualification backgrounds before
    a broader rollout. Ask them to complete realistic tasks and report
    confusing results, incorrect matches, missing content, and export
    problems.
-   Do not declare the MVP ready if factual safeguards, document editing,
    persistence, privacy disclosures, deletion, or PDF exports fail.

------------------------------------------------------------------------

# Standard Instructions for Every DeepSeek Prompt

Append these rules to every phase prompt:

1.  **Inspect first:** read relevant current code before proposing
    changes.
2.  **Current phase only:** do not implement future phases or unrelated
    improvements.
3.  **Reuse architecture:** avoid duplicate services, stores,
    validation, and UI components.
4.  **Protect data:** do not silently overwrite profile edits, generated
    documents, applications, or selections.
5.  **Preserve truthfulness:** never invent candidate facts; job-post
    content is not candidate evidence.
6.  **Bound AI:** validate AI output; AI may suggest semantic
    relationships but cannot independently verify a candidate's skills.
7.  **Protect privacy/security:** keep API keys server-side, validate
    inputs, avoid sensitive logs, and guard against prompt injection and
    unsafe URLs.
8.  **Complete code:** for every created/modified file, provide exact
    repository-relative paths and complete contents; no placeholders,
    omitted sections, or partial diffs.
9.  **Honest testing:** report actual tests, lint, build, and browser
    results; never claim a test ran if it did not.
10. **Self-critique:** review correctness, edge cases, accessibility,
    security, maintainability, regressions, and requirements; fix issues
    before reporting.
11. **Minimize dependencies:** inspect existing dependencies and add
    only what is justified.
12. **Final report:** list files created/modified, checks run and
    results, known limitations, and required manual steps.
13. **MVP scope:** prioritize correctness, editability, persistence,
    privacy, recovery, accessibility, and clean exports over new features.
14. **No silent data loss:** warn before destructive regeneration/deletion
    and preserve saved work unless the user intentionally replaces it.
15. **Release honesty:** do not describe Fesa as secure, verified,
    accessible, or production-ready unless the implementation and checks
    support that claim.

## Git discipline

After each phase passes acceptance criteria: - Review the diff. - Run
relevant checks and manual workflow tests. - Commit that phase
separately. - Do not proceed while critical regressions remain.

Suggested commits: - `test: establish Fesa fine-tuning baseline` -
`fix: improve career profile extraction categories` -
`feat: add certification links to profile and resume` -
`feat: add editable tailored resumes and reliable summaries` -
`feat: add evidence-grounded AI match assistance` -
`feat: add missing-skill review workflow` -
`test: validate end-to-end MVP reliability`

------------------------------------------------------------------------

## MVP Completion Definition

Fesa is ready for controlled beta only when a user can:

1. Upload a resume and review/correct a properly categorized Career
   Profile.
2. Save, reopen, edit, export, and intentionally delete their data.
3. Analyze a real job advertisement and distinguish required from
   preferred criteria.
4. Receive useful cross-industry match analysis grounded in candidate
   evidence, with understandable uncertainty and deterministic fallback
   when AI is unavailable.
5. Review missing, related, or unverified requirements without having
   them silently added to the profile or resume.
6. Generate and edit both the tailored resume and cover letter, including
   the resume summary.
7. Preserve optional certification links and export clean PDFs that
   reflect the latest approved edits.
8. Understand what data is processed by Fesa and its AI provider, and
   recover gracefully from common errors.
9. Use the application without broken layouts, confusing states, or
   major keyboard/accessibility barriers.

### Rollout gate

Before wider release, complete the regression suite and manual workflow,
fix critical/high-impact issues, and run a private beta with about 5–10
testers from different industries and career stages. Use their feedback
to fix correctness, usability, and reliability issues before adding
nonessential features.

Keep job-board scraping, interview coaching, advanced analytics,
collaboration, payments, and elaborate template collections out of this
MVP unless user testing reveals a genuine launch requirement.

**Final rule: AI may help Fesa understand language and improve
presentation. It must never turn a job requirement into an unsupported
claim about the candidate.**
