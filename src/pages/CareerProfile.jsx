import { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ResumeUploader from '../components/ResumeUploader.jsx';
import ProfileEditor from '../components/profile/ProfileEditor.jsx';
import Button from '../components/Button.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { loadProfile, saveProfile } from '../services/careerProfileStore.js';
import { extractCareerProfile } from '../services/careerProfileApi.js';
import {
  exportProfile,
  importProfileFromFile,
} from '../services/profileTransfer.js';
import './CareerProfile.css';

export default function CareerProfile() {
  const [extractedText, setExtractedText] = useState('');
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const importInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initProfile = async () => {
      try {
        const savedProfile = await loadProfile();
        if (isMounted) {
          setProfile(savedProfile || null);
        }
      } catch (error) {
        console.warn('Failed to load saved profile:', error);
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    initProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExtractedText = (text) => {
    setExtractedText(text);
    setBuildError('');
  };

  const handleBuildProfile = async () => {
    if (!extractedText.trim()) return;

    // Protect user edits: if a profile already exists, confirm before replacing.
    if (profile) {
      const confirmed = window.confirm(
        'This will replace your current Career Profile with a newly extracted one. ' +
          'Any manual edits you have made will be lost. Continue?',
      );
      if (!confirmed) return;
    }

    setIsBuilding(true);
    setBuildError('');

    try {
      const extractedProfile = await extractCareerProfile(extractedText);
      setProfile(extractedProfile);
      setIsSaving(true);
      await saveProfile(extractedProfile);
    } catch (error) {
      console.error('Build profile error:', error);
      setBuildError(error.message || 'Failed to build Career Profile.');
    } finally {
      setIsBuilding(false);
      setIsSaving(false);
    }
  };

  const handleProfileChange = async (updatedProfile) => {
    setProfile(updatedProfile);
    setIsSaving(true);
    try {
      await saveProfile(updatedProfile);
    } catch (error) {
      console.warn('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      exportProfile(profile);
    } catch (error) {
      console.error('Export failed:', error);
      setImportStatus({
        type: 'error',
        message: error.message || 'Could not export Career Profile.',
      });
    }
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setImportStatus(null);

    try {
      const importedProfile = await importProfileFromFile(file);

      if (
        profile &&
        !window.confirm(
          'Replace your current Career Profile with the imported profile?',
        )
      ) {
        return;
      }

      await handleProfileChange(importedProfile);
      setImportStatus({
        type: 'success',
        message: 'Career Profile imported successfully.',
      });
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus({
        type: 'error',
        message: error.message || 'Could not import Career Profile.',
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="career-profile">
        <PageHeader
          title="Career Profile"
          description="Your reusable professional profile."
        />
        <LoadingState message="Loading Career Profile..." />
      </div>
    );
  }

  return (
    <div className="career-profile">
      <PageHeader
        title="Career Profile"
        description="Your reusable professional profile. Fesa uses only the information you provide to tailor resumes and cover letters."
        actions={
          <>
            <Button onClick={handleExport} disabled={!profile}>
              Export Profile
            </Button>
            <Button
              variant="secondary"
              onClick={() => importInputRef.current?.click()}
            >
              Import Profile
            </Button>
          </>
        }
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {importStatus && (
        <div className="profile-status">
          <ErrorState
            title={
              importStatus.type === 'success' ? 'Import complete' : 'Import failed'
            }
            message={importStatus.message}
          />
        </div>
      )}

      <ResumeUploader onExtractedText={handleExtractedText} />

      {extractedText && !profile && (
        <div className="build-actions">
          <Button onClick={handleBuildProfile} disabled={isBuilding}>
            {isBuilding ? 'Building...' : 'Build Career Profile'}
          </Button>
        </div>
      )}

      {extractedText && profile && (
        <div className="build-actions">
          <Button
            variant="secondary"
            onClick={handleBuildProfile}
            disabled={isBuilding}
          >
            {isBuilding ? 'Rebuilding...' : 'Rebuild from Resume'}
          </Button>
        </div>
      )}

      {isBuilding && (
        <div className="profile-status">
          <LoadingState message="Building Career Profile..." />
        </div>
      )}

      {isSaving && !isBuilding && (
        <div className="profile-status">
          <LoadingState message="Saving Career Profile..." />
        </div>
      )}

      {buildError && (
        <div className="profile-status">
          <ErrorState
            title="Unable to build Career Profile"
            message={buildError}
            onRetry={handleBuildProfile}
          />
        </div>
      )}

      {profile ? (
        <ProfileEditor profile={profile} onProfileChange={handleProfileChange} />
      ) : (
        !isBuilding &&
        !buildError && (
          <EmptyState
            title="No Career Profile yet"
            description={
              extractedText
                ? 'Click "Build Career Profile" to turn your extracted resume into a structured profile.'
                : 'Upload a resume to get started.'
            }
            actionLabel={extractedText ? 'Build Career Profile' : undefined}
            onAction={extractedText ? handleBuildProfile : undefined}
          />
        )
      )}
    </div>
  );
}