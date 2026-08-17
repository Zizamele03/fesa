import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfWorker();

const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ["pdf", "docx"];
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const EMPTY_PDF_TEXT_MESSAGE =
  "This PDF does not contain enough selectable text to extract. It may be scanned or image-based.";
export const EMPTY_DOCX_TEXT_MESSAGE =
  "This DOCX does not contain any readable text. It may be empty or corrupted.";

function createAbortError() {
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  return error;
}

export function getFileExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;
  const decimals = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

export function validateResumeFile(file) {
  if (!file) {
    return { valid: false, error: "Please choose a file to upload." };
  }

  const extension = getFileExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload a PDF or DOCX resume.",
    };
  }

  if (
    file.type &&
    !SUPPORTED_MIME_TYPES.has(file.type) &&
    file.type !== "application/octet-stream"
  ) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload a PDF or DOCX resume.",
    };
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return {
      valid: false,
      error: "File is too large. The maximum resume size is 10 MB.",
    };
  }

  return { valid: true };
}

async function extractPdfText(file, { signal } = {}) {
  if (signal?.aborted) throw createAbortError();

  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw createAbortError();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  let pdf;
  let aborted = false;

  const handleAbort = () => {
    aborted = true;
    loadingTask.destroy();
  };

  signal?.addEventListener("abort", handleAbort, { once: true });

  try {
    pdf = await loadingTask.promise;

    let extractedText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (signal?.aborted || aborted) throw createAbortError();

      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str || "")
        .filter(Boolean)
        .join(" ");

      extractedText += `${pageText}\n\n`;
      page.cleanup();
    }

    const cleanText = extractedText.trim();

    if (!cleanText) {
      throw new Error(EMPTY_PDF_TEXT_MESSAGE);
    }

    return cleanText;
  } catch (error) {
    if (error?.name === "AbortError" || aborted || signal?.aborted) {
      throw createAbortError();
    }

    if (error?.message === EMPTY_PDF_TEXT_MESSAGE) {
      throw error;
    }

    throw new Error(
      "We could not read this PDF file. It may be corrupted or not a valid PDF.",
      { cause: error },
    );
  } finally {
    signal?.removeEventListener("abort", handleAbort);

    try {
      await pdf?.destroy();
    } catch {
      // Ignore cleanup errors. The document may already be destroyed.
    }
  }
}

async function extractDocxText(file, { signal } = {}) {
  if (signal?.aborted) throw createAbortError();

  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw createAbortError();

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (signal?.aborted) throw createAbortError();

    const cleanText = result.value.trim();

    if (!cleanText) {
      throw new Error(EMPTY_DOCX_TEXT_MESSAGE);
    }

    return cleanText;
  } catch (error) {
    if (error?.name === "AbortError" || signal?.aborted) {
      throw createAbortError();
    }

    if (error?.message === EMPTY_DOCX_TEXT_MESSAGE) {
      throw error;
    }

    throw new Error(
      "We could not read this DOCX file. It may be corrupted or not a valid DOCX.",
      { cause: error },
    );
  }
}

export async function extractTextFromResume(file, { signal } = {}) {
  const extension = getFileExtension(file.name);

  if (extension === "pdf") {
    return extractPdfText(file, { signal });
  }

  if (extension === "docx") {
    return extractDocxText(file, { signal });
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX resume.");
}
