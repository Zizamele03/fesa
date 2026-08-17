import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import ResumeUploader from '../components/ResumeUploader.jsx';
import ProfileEditor from '../components/profile/ProfileEditor.jsx';
import Button from '../components/Button.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { loadProfile, saveProfile } from '../services/careerProfileStore.js';
import { extractCareerProfile } from '../services/careerProfileApi.js';
import './CareerProfile.css';

export default function CareerProfile() {
  const [extractedText, setExtractedText] = useState('');
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      />

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