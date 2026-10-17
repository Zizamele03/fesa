import Button from './Button.jsx';
import SectionCard from './SectionCard.jsx';
import { validateProfileUrl } from '../utils/urlValidation.js';
import './ResumeEditor.css';

function updateArrayItem(array, index, field, value) {
  return array.map((item, i) => (i === index ? { ...item, [field]: value } : item));
}

function removeArrayItem(array, index) {
  return array.filter((_, i) => i !== index);
}

function splitCommaList(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ResumeEditor({ resume, onChange }) {
  if (!resume) return null;

  const set = (patch) => onChange({ ...resume, ...patch });

  // ----- Summary -----
  const handleSummaryChange = (value) => set({ summary: value });

  // ----- Skill groups -----
  const handleSkillGroupLabelChange = (index, value) => {
    set({
      skillGroups: updateArrayItem(resume.skillGroups, index, 'label', value),
    });
  };
  const handleSkillItemChange = (groupIndex, itemIndex, value) => {
    const group = resume.skillGroups[groupIndex];
    const newItems = group.items.map((s, i) => (i === itemIndex ? value : s));
    set({
      skillGroups: updateArrayItem(resume.skillGroups, groupIndex, 'items', newItems),
    });
  };
  const handleAddSkillItem = (groupIndex) => {
    const group = resume.skillGroups[groupIndex];
    set({
      skillGroups: updateArrayItem(resume.skillGroups, groupIndex, 'items', [
        ...group.items,
        '',
      ]),
    });
  };
  const handleRemoveSkillItem = (groupIndex, itemIndex) => {
    const group = resume.skillGroups[groupIndex];
    set({
      skillGroups: updateArrayItem(
        resume.skillGroups,
        groupIndex,
        'items',
        group.items.filter((_, i) => i !== itemIndex),
      ),
    });
  };
  const handleAddSkillGroup = () => {
    set({ skillGroups: [...resume.skillGroups, { label: 'Skills', items: [''] }] });
  };
  const handleRemoveSkillGroup = (index) => {
    set({ skillGroups: removeArrayItem(resume.skillGroups, index) });
  };

  // ----- Experience -----
  const handleAddExperience = () => {
    set({
      experience: [
        ...resume.experience,
        { company: '', position: '', location: '', dates: '', bullets: [''] },
      ],
    });
  };
  const handleExperienceFieldChange = (index, field, value) => {
    set({ experience: updateArrayItem(resume.experience, index, field, value) });
  };
  const handleExperienceBulletChange = (index, bulletIndex, value) => {
    const job = resume.experience[index];
    const bullets = job.bullets.map((b, i) => (i === bulletIndex ? value : b));
    set({ experience: updateArrayItem(resume.experience, index, 'bullets', bullets) });
  };
  const handleAddExperienceBullet = (index) => {
    const job = resume.experience[index];
    set({
      experience: updateArrayItem(resume.experience, index, 'bullets', [
        ...job.bullets,
        '',
      ]),
    });
  };
  const handleRemoveExperienceBullet = (index, bulletIndex) => {
    const job = resume.experience[index];
    set({
      experience: updateArrayItem(
        resume.experience,
        index,
        'bullets',
        job.bullets.filter((_, i) => i !== bulletIndex),
      ),
    });
  };
  const handleRemoveExperience = (index) => {
    set({ experience: removeArrayItem(resume.experience, index) });
  };

  // ----- Education -----
  const handleAddEducation = () => {
    set({
      education: [
        ...resume.education,
        {
          qualification: '',
          fieldOfStudy: '',
          institution: '',
          location: '',
          dates: '',
          description: '',
        },
      ],
    });
  };
  const handleEducationChange = (index, field, value) => {
    set({ education: updateArrayItem(resume.education, index, field, value) });
  };
  const handleRemoveEducation = (index) => {
    set({ education: removeArrayItem(resume.education, index) });
  };

  // ----- Projects -----
  const handleAddProject = () => {
    set({
      projects: [
        ...resume.projects,
        { name: '', description: '', technologies: [], url: '' },
      ],
    });
  };
  const handleProjectChange = (index, field, value) => {
    set({ projects: updateArrayItem(resume.projects, index, field, value) });
  };
  const handleProjectTechChange = (index, value) => {
    set({
      projects: updateArrayItem(resume.projects, index, 'technologies', splitCommaList(value)),
    });
  };
  const handleRemoveProject = (index) => {
    set({ projects: removeArrayItem(resume.projects, index) });
  };

  // ----- Certifications -----
  const handleAddCertification = () => {
    set({
      certifications: [
        ...resume.certifications,
        { name: '', issuer: '', date: '', url: '', credentialId: '' },
      ],
    });
  };
  const handleCertificationChange = (index, field, value) => {
    set({
      certifications: updateArrayItem(resume.certifications, index, field, value),
    });
  };
  const handleRemoveCertification = (index) => {
    set({ certifications: removeArrayItem(resume.certifications, index) });
  };

  // ----- Achievements -----
  const handleAddAchievement = () => {
    set({
      achievements: [...resume.achievements, { title: '', description: '', date: '' }],
    });
  };
  const handleAchievementChange = (index, field, value) => {
    set({ achievements: updateArrayItem(resume.achievements, index, field, value) });
  };
  const handleRemoveAchievement = (index) => {
    set({ achievements: removeArrayItem(resume.achievements, index) });
  };

  // ----- References -----
  const handleReferencesToggle = (checked) => set({ referencesIncluded: checked });
  const handleReferenceChange = (index, field, value) => {
    set({ references: updateArrayItem(resume.references, index, field, value) });
  };
  const handleRemoveReference = (index) => {
    set({ references: removeArrayItem(resume.references, index) });
  };

  const hasReferences = (resume.references || []).length > 0;

  return (
    <div className="resume-editor">
      <SectionCard title="Professional Summary">
        <textarea
          value={resume.summary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          rows={5}
          placeholder="Write a short professional summary, or leave empty."
        />
      </SectionCard>

      <SectionCard
        title="Skills"
        action={
          <Button size="sm" onClick={handleAddSkillGroup}>
            Add Skill Group
          </Button>
        }
      >
        {resume.skillGroups.length === 0 ? (
          <p className="section-empty">No skill groups yet.</p>
        ) : (
          resume.skillGroups.map((group, gIndex) => (
            <div className="resume-editor-entry" key={gIndex}>
              <div className="resume-editor-entry-header">
                <input
                  className="resume-editor-title-input"
                  value={group.label}
                  onChange={(e) => handleSkillGroupLabelChange(gIndex, e.target.value)}
                  placeholder="Group label (e.g. Programming Languages)"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveSkillGroup(gIndex)}
                >
                  Remove Group
                </Button>
              </div>
              <div className="resume-editor-list">
                {group.items.map((item, iIndex) => (
                  <div className="resume-editor-list-row" key={iIndex}>
                    <input
                      value={item}
                      onChange={(e) =>
                        handleSkillItemChange(gIndex, iIndex, e.target.value)
                      }
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveSkillItem(gIndex, iIndex)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="sm" onClick={() => handleAddSkillItem(gIndex)}>
                Add Skill
              </Button>
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
        {resume.experience.length === 0 ? (
          <p className="section-empty">No experience entries yet.</p>
        ) : (
          resume.experience.map((job, index) => (
            <div className="resume-editor-entry" key={index}>
              <div className="resume-editor-entry-header">
                <h3>{job.position || 'Experience'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveExperience(index)}
                >
                  Remove
                </Button>
              </div>
              <div className="resume-editor-grid">
                <label>
                  Position
                  <input
                    value={job.position}
                    onChange={(e) =>
                      handleExperienceFieldChange(index, 'position', e.target.value)
                    }
                  />
                </label>
                <label>
                  Company
                  <input
                    value={job.company}
                    onChange={(e) =>
                      handleExperienceFieldChange(index, 'company', e.target.value)
                    }
                  />
                </label>
                <label>
                  Location
                  <input
                    value={job.location}
                    onChange={(e) =>
                      handleExperienceFieldChange(index, 'location', e.target.value)
                    }
                  />
                </label>
                <label>
                  Dates
                  <input
                    value={job.dates}
                    onChange={(e) =>
                      handleExperienceFieldChange(index, 'dates', e.target.value)
                    }
                    placeholder="e.g. Jan 2021 – Present"
                  />
                </label>
              </div>
              <div className="resume-editor-bullets">
                <p className="resume-editor-bullets-label">Bullets</p>
                {job.bullets.map((bullet, bulletIndex) => (
                  <div className="resume-editor-list-row" key={bulletIndex}>
                    <textarea
                      value={bullet}
                      rows={2}
                      onChange={(e) =>
                        handleExperienceBulletChange(index, bulletIndex, e.target.value)
                      }
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveExperienceBullet(index, bulletIndex)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button size="sm" onClick={() => handleAddExperienceBullet(index)}>
                  Add Bullet
                </Button>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Education"
        action={
          <Button size="sm" onClick={handleAddEducation}>
            Add Education
          </Button>
        }
      >
        {resume.education.length === 0 ? (
          <p className="section-empty">No education entries yet.</p>
        ) : (
          resume.education.map((edu, index) => (
            <div className="resume-editor-entry" key={index}>
              <div className="resume-editor-entry-header">
                <h3>{edu.institution || 'Education'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveEducation(index)}
                >
                  Remove
                </Button>
              </div>
              <div className="resume-editor-grid">
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
                  Institution
                  <input
                    value={edu.institution}
                    onChange={(e) =>
                      handleEducationChange(index, 'institution', e.target.value)
                    }
                  />
                </label>
                <label>
                  Location
                  <input
                    value={edu.location}
                    onChange={(e) =>
                      handleEducationChange(index, 'location', e.target.value)
                    }
                  />
                </label>
                <label>
                  Dates
                  <input
                    value={edu.dates}
                    onChange={(e) =>
                      handleEducationChange(index, 'dates', e.target.value)
                    }
                  />
                </label>
              </div>
              <label className="resume-editor-full">
                Description
                <textarea
                  rows={3}
                  value={edu.description}
                  onChange={(e) =>
                    handleEducationChange(index, 'description', e.target.value)
                  }
                />
              </label>
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
        {resume.projects.length === 0 ? (
          <p className="section-empty">No projects yet.</p>
        ) : (
          resume.projects.map((project, index) => {
            const urlCheck = validateProfileUrl(project.url);
            return (
              <div className="resume-editor-entry" key={index}>
                <div className="resume-editor-entry-header">
                  <h3>{project.name || 'Project'}</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveProject(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="resume-editor-grid">
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
                    Technologies (comma separated)
                    <input
                      value={(project.technologies || []).join(', ')}
                      onChange={(e) => handleProjectTechChange(index, e.target.value)}
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
                    />
                    {!urlCheck.valid && !urlCheck.empty && (
                      <span className="field-error">{urlCheck.error}</span>
                    )}
                  </label>
                </div>
                <label className="resume-editor-full">
                  Description
                  <textarea
                    rows={3}
                    value={project.description}
                    onChange={(e) =>
                      handleProjectChange(index, 'description', e.target.value)
                    }
                  />
                </label>
              </div>
            );
          })
        )}
      </SectionCard>

      <SectionCard
        title="Certifications"
        action={
          <Button size="sm" onClick={handleAddCertification}>
            Add Certification
          </Button>
        }
      >
        {resume.certifications.length === 0 ? (
          <p className="section-empty">No certifications yet.</p>
        ) : (
          resume.certifications.map((cert, index) => {
            const urlCheck = validateProfileUrl(cert.url);
            return (
              <div className="resume-editor-entry" key={index}>
                <div className="resume-editor-entry-header">
                  <h3>{cert.name || 'Certification'}</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveCertification(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="resume-editor-grid">
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
                    URL (optional)
                    <input
                      type="url"
                      value={cert.url}
                      onChange={(e) =>
                        handleCertificationChange(index, 'url', e.target.value)
                      }
                    />
                    {!urlCheck.valid && !urlCheck.empty && (
                      <span className="field-error">{urlCheck.error}</span>
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
        {resume.achievements.length === 0 ? (
          <p className="section-empty">No achievements yet.</p>
        ) : (
          resume.achievements.map((achievement, index) => (
            <div className="resume-editor-entry" key={index}>
              <div className="resume-editor-entry-header">
                <h3>{achievement.title || 'Achievement'}</h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveAchievement(index)}
                >
                  Remove
                </Button>
              </div>
              <div className="resume-editor-grid">
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
                  Date
                  <input
                    value={achievement.date}
                    onChange={(e) =>
                      handleAchievementChange(index, 'date', e.target.value)
                    }
                  />
                </label>
              </div>
              <label className="resume-editor-full">
                Description
                <textarea
                  rows={2}
                  value={achievement.description}
                  onChange={(e) =>
                    handleAchievementChange(index, 'description', e.target.value)
                  }
                />
              </label>
            </div>
          ))
        )}
      </SectionCard>

      <SectionCard title="References">
        {!hasReferences ? (
          <p className="section-empty">
            No references saved. Add references to your Career Profile to include
            them here.
          </p>
        ) : (
          <>
            <label className="resume-editor-toggle">
              <input
                type="checkbox"
                checked={Boolean(resume.referencesIncluded)}
                onChange={(e) => handleReferencesToggle(e.target.checked)}
              />
              Include reference details in this resume
            </label>
            {resume.references.map((ref, index) => (
              <div className="resume-editor-entry" key={index}>
                <div className="resume-editor-entry-header">
                  <h3>{ref.name || 'Reference'}</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveReference(index)}
                  >
                    Remove from this resume
                  </Button>
                </div>
                <div className="resume-editor-grid">
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
                </div>
                <label className="resume-editor-full">
                  Notes
                  <textarea
                    rows={2}
                    value={ref.notes}
                    onChange={(e) =>
                      handleReferenceChange(index, 'notes', e.target.value)
                    }
                  />
                </label>
              </div>
            ))}
            <p className="resume-editor-hint">
              Edits here apply only to this resume. To change your saved
              references, edit your Career Profile.
            </p>
          </>
        )}
      </SectionCard>
    </div>
  );
}