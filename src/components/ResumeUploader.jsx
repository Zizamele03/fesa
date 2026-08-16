import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';
import LoadingState from './LoadingState.jsx';
import ErrorState from './ErrorState.jsx';
import SectionCard from './SectionCard.jsx';
import {
  extractTextFromResume,
  formatFileSize,
  getFileExtension,
  validateResumeFile,
} from '../service/documentParser.js';
import './ResumeUploader.css';

export default function ResumeUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [extractedText, setExtractedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef(null);
  const extractionIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  function clearError() {
    setErrorMessage('');
  }

  async function processFile(file) {
    clearError();

    const validation = validateResumeFile(file);

    if (!validation.valid) {
      setErrorMessage(validation.error);
      setStatus('error');
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentExtractionId = ++extractionIdRef.current;

    setSelectedFile(file);
    setExtractedText('');
    setStatus('loading');

    try {
      const text = await extractTextFromResume(file, {
        signal: controller.signal,
      });

      if (
        currentExtractionId !== extractionIdRef.current ||
        !isMountedRef.current ||
        controller.signal.aborted
      ) {
        return;
      }

      setExtractedText(text);
      setStatus('success');
      clearError();
    } catch (error) {
      if (
        currentExtractionId !== extractionIdRef.current ||
        !isMountedRef.current ||
        error?.name === 'AbortError' ||
        controller.signal.aborted
      ) {
        return;
      }

      setErrorMessage(
        error.message || 'Unable to extract text from this file.',
      );
      setStatus('error');
    }
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    event.target.value = '';
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleReplace() {
    inputRef.current?.click();
  }

  function handleRemove() {
    abortControllerRef.current?.abort();
    extractionIdRef.current += 1;
    setSelectedFile(null);
    setExtractedText('');
    setStatus('idle');
    setErrorMessage('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRetry() {
    if (selectedFile) processFile(selectedFile);
  }

  const fileTypeLabel = selectedFile
    ? getFileExtension(selectedFile.name).toUpperCase()
    : '';

  return (
    <div className="resume-uploader">
      <SectionCard title="Upload Resume" action={null}>
        <p className="upload-help">PDF or DOCX • Maximum 10 MB</p>

        {!selectedFile && (
          <button
            type="button"
            className={`upload-dropzone ${isDragging ? 'is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            aria-label="Upload resume"
          >
            <span className="upload-dropzone-icon" aria-hidden="true">
              📄
            </span>
            <span className="upload-dropzone-title">
              Click to choose a resume
            </span>
            <span className="upload-dropzone-hint">
              or drag and drop a PDF or DOCX here
            </span>
          </button>
        )}

        {selectedFile && (
          <div className="selected-file">
            <span className="selected-file-icon" aria-hidden="true">
              📄
            </span>
            <div className="selected-file-details">
              <p className="selected-file-name">{selectedFile.name}</p>
              <p className="selected-file-meta">
                {fileTypeLabel} · {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <div className="selected-file-actions">
              <Button variant="ghost" size="sm" onClick={handleReplace}>
                Replace
              </Button>
              <Button variant="danger" size="sm" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <LoadingState
            message={`Reading ${selectedFile?.name || 'resume'}...`}
          />
        )}

        {status === 'error' && errorMessage && (
          <ErrorState
            title="Unable to extract text"
            message={errorMessage}
            onRetry={selectedFile ? handleRetry : undefined}
            retryLabel="Try again"
          />
        )}

        {status === 'success' && extractedText && (
          <div className="extracted-text">
            <div className="extracted-text-header">
              <h3>Extraction complete</h3>
              <span>{extractedText.length.toLocaleString()} characters extracted</span>
            </div>
            <pre className="extracted-text-preview">{extractedText}</pre>
          </div>
        )}
      </SectionCard>

      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}