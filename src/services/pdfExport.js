import { createElement } from 'react';

export function sanitizeFilenamePart(value, fallback = 'Document') {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);

  return cleaned || fallback;
}

export function buildFilename(company, jobTitle, suffix) {
  const c = sanitizeFilenamePart(company, 'Company');
  const t = sanitizeFilenamePart(jobTitle, 'Position');
  const s = sanitizeFilenamePart(suffix, 'Document');
  return `${c}_${t}_${s}.pdf`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadResumePdf({ resume, company, jobTitle }) {
  if (!resume || typeof resume !== 'object') {
    throw new Error('No resume available to export.');
  }

  const [{ pdf }, { default: ResumeDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/pdf/ResumeDocument.jsx'),
  ]);

  const element = createElement(ResumeDocument, { resume });
  const blob = await pdf(element).toBlob();
  triggerDownload(blob, buildFilename(company, jobTitle, 'Resume'));
}

export async function downloadCoverLetterPdf({
  coverLetter,
  company,
  jobTitle,
}) {
  if (!coverLetter || typeof coverLetter !== 'object') {
    throw new Error('No cover letter available to export.');
  }

  const [{ pdf }, { default: CoverLetterDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/pdf/CoverLetterDocument.jsx'),
  ]);

  const element = createElement(CoverLetterDocument, { coverLetter });
  const blob = await pdf(element).toBlob();
  triggerDownload(blob, buildFilename(company, jobTitle, 'Cover_Letter'));
}