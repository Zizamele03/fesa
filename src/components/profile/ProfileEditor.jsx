import Button from '../Button.jsx';
import SectionCard from '../SectionCard.jsx';
import {
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProject,
  createEmptyCertification,
  createEmptyAchievement,
  createEmptyReference,
} from '../../data/careerProfileSchema.js';
import { validateProfileUrl } from '../../utils/urlValidation.js';
import './ProfileEditor.css';

const SKILL_CATEGORY_LABELS = {
  technical: 'Technical Skills',
  soft: 'Soft Skills',
  tools: 'Tools',
  languages: 'Programming Languages',
  queryLanguages: 'Query Languages',
  humanLanguages: 'Human Languages',
  frameworks: 'Frameworks & Libraries',
  databases: 'Databases',
  cloud: 'Cloud Platforms',
  uncertain: 'Uncertain — Please Review',
};

function categoryLabel(category) {
  return (
    SKILL_CATEGORY_LABELS[category] ||
    category[0].toUpperCase() + category.slice(1)
  );
}

function updateNestedValue(obj, path, value) {
  const newObj = JSON.parse(JSON.stringify(obj));
  let current = newObj;
  for (let i = 0; i < path.length - 1; i += 1) {
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
  return newObj;
}

function updateArrayItem(array, index, field, value) {
  return array.map((item, i) => (i === index ? { ...item, [field]: value } : item));
}

function removeArrayItem(array, index) {
  return array.filter((_, i) => i !== index);
}

export default function ProfileEditor({ profile, onProfileChange }) {
  if (!profile) return null;

  const handlePersonalChange = (field, value) => {
    onProfileChange(updateNestedValue(profile, ['personal', field], value));
  };

  const handleSummaryChange = (value) => {
    onProfileChange({ ...profile, professionalSummary: value });
  };

  const handleAddEducation = () => {
    onProfileChange({
      ...profile,
      education: [...profile.education, createEmptyEducation()],
    });
  };

  const handleEducationChange = (index, field, value) => {
    onProfileChange({
      ...profile,
      education: updateArrayItem(profile.education, index, field, value),
    });
  };

  const handleDeleteEducation = (index) => {
    onProfileChange({
      ...profile,
      education: removeArrayItem(profile.education, index),
    });
  };

  const handleAddExperience = () => {
    onProfileChange({
      ...profile,
      experience: [...profile.experience, createEmptyExperience()],
    });
  };

  const handleExperienceChange = (index, field, value) => {
    onProfileChange({
      ...profile,
      experience: updateArrayItem(profile.experience, index, field, value),
    });
  };

  const handleDeleteExperience = (index) => {
    onProfileChange({
      ...profile,
      experience: removeArrayItem(profile.experience, index),
    });
  };

  const handleAddProject = () => {
    onProfileChange({
      ...profile,
      projects: [...profile.projects, createEmptyProject()],
    });
  };

  const handleProjectChange = (index, field, value) => {
    onProfileChange({
      ...profile,
      projects: updateArrayItem(profile.projects, index, field, value),
    });
  };

  const handleDeleteProject = (index) => {
    onProfileChange({
      ...profile,
      projects: removeArrayItem(profile.projects, index),
    });
  };

  const handleAddCertification = () => {
    onProfileChange({
      ...profile,
      certifications: [...profile.certifications, createEmptyCertification()],
    });
  };

  const handleCertificationChange = (index, field, value) => {
    onProfileChange({
      ...profile,
      certifications: updateArrayItem(profile.certifications, index, field, value),
    });
  };

  const handleDeleteCertification = (index) => {
    onProfileChange({
      ...profile,
      certifications: removeArrayItem(profile.certifications, index),
    });
  };

  const handleAddAchievement = () => {
    onProfileChange({
      ...profile,
      achievements: [...profile.achievements, createEmptyAchievement()],
    });
  };

  const handleAchievementChange = (index, field, value) => {
    onProfileChange({
      ...profile,
      achievements: updateArrayItem(profile.achievements, index, field, value),
    });
  };

  const handleDeleteAchievement = (index) => {
    onProfileChange({
      ...profile,
      achievements: removeArrayItem(profile.achievements, index),
    });
  };

  const handleAddReference = () => {
    onProfileChange({
      ...profile,
      references: [...(profile.references || []), createEmptyReference()],
    });
  };

  const handleReferenceChange = (index, field, value) => {
    const refs = profile.references || [];
    onProfileChange({
      ...profile,
      references: updateArrayItem(refs, index, field, value),
    });
  };

  const handleDeleteReference = (index) => {
    const refs = profile.references || [];
    onProfileChange({
      ...profile,
      references: removeArrayItem(refs, index),
    });
  };

  const handleSkillChange = (category, index, value) => {
    const list = profile.skills[category] || [];
    const newSkills = {
      ...profile.skills,
      [category]: list.map((skill, i) => (i === index ? value : skill)),
    };
    onProfileChange({ ...profile, skills: newSkills });
  };

  const handleAddSkill = (category) => {
    const list = profile.skills[category] || [];
    const newSkills = {
      ...profile.skills,
      [category]: [...list, ''],
    };
    onProfileChange({ ...profile, skills: newSkills });
  };

  const handleDeleteSkill = (category, index) => {
    const list = profile.skills[category] || [];
    const newSkills = {
      ...profile.skills,
      [category]: list.filter((_, i) => i !== index),
    };
    onProfileChange({ ...profile, skills: newSkills });
  };

  const references = profile.references || [];

  return (
    <div className="profile-editor">
      <SectionCard title="Personal Information">
        <div className="form-grid">
          <label>
            Full Name
            <input
              value={profile.personal.fullName}
              onChange={(e) => handlePersonalChange('fullName', e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profile.personal.email}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              value={profile.personal.phone}
              onChange={(e) => handlePersonalChange('phone', e.target.value)}
            />
          </label>
          <label>
            Location
            <input
              value={profile.personal.location}
              onChange={(e) => handlePersonalChange('location', e.target.value)}
            />
          </label>
          <label>
            LinkedIn
            <input
              value={profile.personal.linkedin}
              onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
            />
          </label>
          <label>
            GitHub
            <input
              value={profile.personal.github}
              onChange={(e) => handlePersonalChange('github', e.target.value)}
            />
          </label>
          <label>
            Portfolio
            <input
              value={profile.personal.portfolio}
              onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Professional Summary">
        <textarea
          value={profile.professionalSummary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          rows={4}
        />
      </SectionCard>

      <SectionCard
        title="Education"
        action={
          <Button size="sm" onClick={handleAddEducation}>
            Add Education
          </Button>
        }
      >
        {profile.education.length === 0 ? (
          <p className="section-empty">No education entries yet.</p>
        ) : (
          profile.education.map((edu, index) => (
            <div className="editor-item" key={index}>
              <div className="editor-item-header">
                <h3>{edu.institution || 'Education'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteEducation(index)}
                >
                  Delete
                </Button>
              </div>
              <div className="form-grid">
                <label>
                  Institution
                  <input
                    value={edu.institution}
                    onChange={(e) =>
                      handleEducationChange(index, 'institution', e.target.value)
                    }
                  />
                </label>
                <label>
                  Qualification
                  <input
                    value={edu.qualification}
                    onChange={(e) =>
                      handleEducationChange(index, 'qualification', e.target.value)
                    }
                  />
                </label>
                <label>
                  Field of Study
                  <input
                    value={edu.fieldOfStudy}
                    onChange={(e) =>
                      handleEducationChange(index, 'fieldOfStudy', e.target.value)
                    }
                  />
                </label>
                <label>
                  Start Date
                  <input
                    value={edu.startDate}
                    onChange={(e) =>
                      handleEducationChange(index, 'startDate', e.target.value)
                    }
                  />
                </label>
                <label>
                  End Date
                  <input
                    value={edu.endDate}
                    onChange={(e) =>
                      handleEducationChange(index, 'endDate', e.target.value)
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={edu.description}
                    onChange={(e) =>
                      handleEducationChange(index, 'description', e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Work Experience"
        action={
          <Button size="sm" onClick={handleAddExperience}>
            Add Experience
          </Button>
        }
      >
        {profile.experience.length === 0 ? (
          <p className="section-empty">No work experience yet.</p>
        ) : (
          profile.experience.map((exp, index) => (
            <div className="editor-item" key={index}>
              <div className="editor-item-header">
                <h3>{exp.position || 'Experience'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteExperience(index)}
                >
                  Delete
                </Button>
              </div>
              <div className="form-grid">
                <label>
                  Company
                  <input
                    value={exp.company}
                    onChange={(e) =>
                      handleExperienceChange(index, 'company', e.target.value)
                    }
                  />
                </label>
                <label>
                  Position
                  <input
                    value={exp.position}
                    onChange={(e) =>
                      handleExperienceChange(index, 'position', e.target.value)
                    }
                  />
                </label>
                <label>
                  Location
                  <input
                    value={exp.location}
                    onChange={(e) =>
                      handleExperienceChange(index, 'location', e.target.value)
                    }
                  />
                </label>
                <label>
                  Start Date
                  <input
                    value={exp.startDate}
                    onChange={(e) =>
                      handleExperienceChange(index, 'startDate', e.target.value)
                    }
                  />
                </label>
                <label>
                  End Date
                  <input
                    value={exp.endDate}
                    onChange={(e) =>
                      handleExperienceChange(index, 'endDate', e.target.value)
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) =>
                      handleExperienceChange(index, 'current', e.target.checked)
                    }
                  />
                  Current
                </label>
                <label>
                  Description
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleExperienceChange(index, 'description', e.target.value)
                    }
                  />
                </label>
                <label>
                  Responsibilities (comma separated)
                  <textarea
                    value={exp.responsibilities.join(', ')}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        'responsibilities',
                        e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                      )
                    }
                  />
                </label>
                <label>
                  Achievements (comma separated)
                  <textarea
                    value={exp.achievements.join(', ')}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        'achievements',
                        e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                      )
                    }
                  />
                </label>
                <label>
                  Technologies (comma separated)
                  <textarea
                    value={exp.technologies.join(', ')}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        'technologies',
                        e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Projects"
        action={
          <Button size="sm" onClick={handleAddProject}>
            Add Project
          </Button>
        }
      >
        {profile.projects.length === 0 ? (
          <p className="section-empty">No projects yet.</p>
        ) : (
          profile.projects.map((project, index) => {
            const urlCheck = validateProfileUrl(project.url);
            return (
              <div className="editor-item" key={index}>
                <div className="editor-item-header">
                  <h3>{project.name || 'Project'}</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteProject(index)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      value={project.name}
                      onChange={(e) =>
                        handleProjectChange(index, 'name', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={project.description}
                      onChange={(e) =>
                        handleProjectChange(index, 'description', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Technologies (comma separated)
                    <textarea
                      value={project.technologies.join(', ')}
                      onChange={(e) =>
                        handleProjectChange(
                          index,
                          'technologies',
                          e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                        )
                      }
                    />
                  </label>
                  <label>
                    URL
                    <input
                      type="url"
                      value={project.url}
                      onChange={(e) =>
                        handleProjectChange(index, 'url', e.target.value)
                      }
                      placeholder="https://github.com/..."
                      aria-invalid={!urlCheck.valid && !urlCheck.empty}
                    />
                    {!urlCheck.valid && !urlCheck.empty && (
                      <span className="field-error">{urlCheck.error}</span>
                    )}
                  </label>
                  <label>
                    Role
                    <input
                      value={project.role}
                      onChange={(e) =>
                        handleProjectChange(index, 'role', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Achievements (comma separated)
                    <textarea
                      value={project.achievements.join(', ')}
                      onChange={(e) =>
                        handleProjectChange(
                          index,
                          'achievements',
                          e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            );
          })
        )}
      </SectionCard>

      <SectionCard title="Skills">
        {Object.entries(profile.skills).map(([category, skills]) => (
          <div className="skill-editor-group" key={category}>
            <h3>{categoryLabel(category)}</h3>
            <div className="skill-editor-list">
              {skills.map((skill, skillIndex) => (
                <div className="skill-editor-row" key={skillIndex}>
                  <input
                    value={skill}
                    onChange={(e) =>
                      handleSkillChange(category, skillIndex, e.target.value)
                    }
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteSkill(category, skillIndex)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button size="sm" onClick={() => handleAddSkill(category)}>
              Add Skill
            </Button>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Certifications"
        action={
          <Button size="sm" onClick={handleAddCertification}>
            Add Certification
          </Button>
        }
      >
        {profile.certifications.length === 0 ? (
          <p className="section-empty">No certifications yet.</p>
        ) : (
          profile.certifications.map((cert, index) => {
            const urlCheck = validateProfileUrl(cert.url);
            return (
              <div className="editor-item" key={index}>
                <div className="editor-item-header">
                  <h3>{cert.name || 'Certification'}</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteCertification(index)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      value={cert.name}
                      onChange={(e) =>
                        handleCertificationChange(index, 'name', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Issuer
                    <input
                      value={cert.issuer}
                      onChange={(e) =>
                        handleCertificationChange(index, 'issuer', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Date
                    <input
                      value={cert.date}
                      onChange={(e) =>
                        handleCertificationChange(index, 'date', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Credential ID
                    <input
                      value={cert.credentialId}
                      onChange={(e) =>
                        handleCertificationChange(index, 'credentialId', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Certification URL (optional)
                    <input
                      type="url"
                      value={cert.url}
                      onChange={(e) =>
                        handleCertificationChange(index, 'url', e.target.value)
                      }
                      placeholder="https://example.com/verify/abc123"
                      aria-invalid={!urlCheck.valid && !urlCheck.empty}
                    />
                    {!urlCheck.valid && !urlCheck.empty && (
                      <span className="field-error">{urlCheck.error}</span>
                    )}
                    {urlCheck.empty && (
                      <span className="field-hint">
                        Optional. Use an HTTPS link to the credential
                        verification page.
                      </span>
                    )}
                  </label>
                </div>
              </div>
            );
          })
        )}
      </SectionCard>

      <SectionCard
        title="Achievements"
        action={
          <Button size="sm" onClick={handleAddAchievement}>
            Add Achievement
          </Button>
        }
      >
        {profile.achievements.length === 0 ? (
          <p className="section-empty">No achievements yet.</p>
        ) : (
          profile.achievements.map((achievement, index) => (
            <div className="editor-item" key={index}>
              <div className="editor-item-header">
                <h3>{achievement.title || 'Achievement'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteAchievement(index)}
                >
                  Delete
                </Button>
              </div>
              <div className="form-grid">
                <label>
                  Title
                  <input
                    value={achievement.title}
                    onChange={(e) =>
                      handleAchievementChange(index, 'title', e.target.value)
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={achievement.description}
                    onChange={(e) =>
                      handleAchievementChange(index, 'description', e.target.value)
                    }
                  />
                </label>
                <label>
                  Date
                  <input
                    value={achievement.date}
                    onChange={(e) =>
                      handleAchievementChange(index, 'date', e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="References"
        action={
          <Button size="sm" onClick={handleAddReference}>
            Add Reference
          </Button>
        }
      >
        <p className="section-empty" style={{ marginBottom: '0.75rem' }}>
          References are optional. They are stored on your device and never sent
          to the AI provider. You choose whether to include them in each resume.
        </p>
        {references.length === 0 ? (
          <p className="section-empty">No references saved yet.</p>
        ) : (
          references.map((ref, index) => (
            <div className="editor-item" key={index}>
              <div className="editor-item-header">
                <h3>{ref.name || 'Reference'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteReference(index)}
                >
                  Delete
                </Button>
              </div>
              <div className="form-grid">
                <label>
                  Name
                  <input
                    value={ref.name}
                    onChange={(e) =>
                      handleReferenceChange(index, 'name', e.target.value)
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={ref.title}
                    onChange={(e) =>
                      handleReferenceChange(index, 'title', e.target.value)
                    }
                  />
                </label>
                <label>
                  Organization
                  <input
                    value={ref.organization}
                    onChange={(e) =>
                      handleReferenceChange(index, 'organization', e.target.value)
                    }
                  />
                </label>
                <label>
                  Relationship
                  <input
                    value={ref.relationship}
                    onChange={(e) =>
                      handleReferenceChange(index, 'relationship', e.target.value)
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={ref.email}
                    onChange={(e) =>
                      handleReferenceChange(index, 'email', e.target.value)
                    }
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={ref.phone}
                    onChange={(e) =>
                      handleReferenceChange(index, 'phone', e.target.value)
                    }
                  />
                </label>
                <label>
                  Notes
                  <textarea
                    value={ref.notes}
                    onChange={(e) =>
                      handleReferenceChange(index, 'notes', e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </SectionCard>
    </div>
  );
}