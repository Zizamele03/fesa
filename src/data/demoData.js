export const dashboardStats = {
  careerProfileCompletion: 72,
  applicationsCreated: 6,
  recentApplicationsCount: 4,
};

export const recentApplications = [
  {
    id: 1,
    company: 'Northwind Labs',
    jobTitle: 'Frontend Engineer',
    status: 'Package ready',
    updatedAt: 'Aug 12, 2026',
    statusTone: 'success',
  },
  {
    id: 2,
    company: 'Cedar & Stone',
    jobTitle: 'UI Developer',
    status: 'In progress',
    updatedAt: 'Aug 8, 2026',
    statusTone: 'warning',
  },
  {
    id: 3,
    company: 'Brightpath Software',
    jobTitle: 'React Engineer',
    status: 'Analyzed',
    updatedAt: 'Jul 30, 2026',
    statusTone: 'info',
  },
  {
    id: 4,
    company: 'Harborview Health',
    jobTitle: 'Frontend Developer',
    status: 'Draft',
    updatedAt: 'Jul 22, 2026',
    statusTone: 'neutral',
  },
];

export const careerProfile = {
  personalInformation: {
    fullName: 'Jordan Blake',
    email: 'jordan.blake@example.com',
    phone: '+1 (555) 210-4482',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/jordanblake',
  },
  professionalSummary:
    'Frontend engineer with four years of experience building accessible, high-performance web applications for B2B SaaS products. Comfortable working across design systems, component libraries, and close collaboration with product and design teams.',
  education: [
    {
      id: 1,
      degree: 'B.S. Computer Science',
      institution: 'Texas State University',
      location: 'San Marcos, TX',
      year: '2021',
      details: 'Minor in UX Design',
    },
  ],
  workExperience: [
    {
      id: 1,
      title: 'Frontend Engineer',
      company: 'Brightpath Software',
      location: 'Austin, TX',
      dates: 'Jun 2021 – Present',
      bullets: [
        'Lead implementation of a React component library used by 8 product teams.',
        'Reduced average page load time by 34% through code splitting and image optimization.',
        'Partnered with design to create an accessible form system that supports WCAG AA.',
        'Mentored two junior engineers and introduced unit testing standards.',
      ],
    },
    {
      id: 2,
      title: 'Junior Web Developer',
      company: 'LocalGood Studio',
      location: 'Remote',
      dates: 'May 2020 – May 2021',
      bullets: [
        'Built and maintained responsive marketing pages for small business clients.',
        'Implemented reusable HTML/CSS patterns and improved Lighthouse accessibility scores.',
      ],
    },
  ],
  projects: [
    {
      id: 1,
      name: 'Accessible Job Board UI',
      description:
        'Designed and built a reusable filter and listing interface focused on keyboard and screen reader usability.',
      technologies: ['React', 'CSS Modules', 'Radix UI'],
    },
    {
      id: 2,
      name: 'Personal Finance Dashboard',
      description:
        'Created a lightweight analytics dashboard with responsive charts and a focus on mobile readability.',
      technologies: ['React', 'Recharts', 'Vite'],
    },
  ],
  skills: {
    technical: [
      'React',
      'JavaScript',
      'HTML',
      'CSS',
      'Vite',
      'Git',
      'REST APIs',
      'Jest',
      'Playwright',
      'Accessibility',
    ],
    soft: [
      'Cross-functional collaboration',
      'Technical writing',
      'Mentorship',
      'Time management',
    ],
  },
  certifications: [
    {
      id: 1,
      name: 'Professional Scrum Developer I',
      issuer: 'Scrum.org',
      year: '2023',
    },
    {
      id: 2,
      name: 'Responsive Web Design',
      issuer: 'freeCodeCamp',
      year: '2020',
    },
  ],
  achievements: [
    {
      id: 1,
      title: 'Hackathon Winner',
      description: 'Built an accessible scheduling tool for remote volunteer teams in 36 hours.',
      year: '2022',
    },
    {
      id: 2,
      title: 'Speaker — Local React Meetup',
      description: 'Presented on building reusable form primitives with React.',
      year: '2023',
    },
  ],
};

export const jobAnalysis = {
  company: 'Northwind Labs',
  jobTitle: 'Frontend Engineer',
  overallMatch: 86,
  keyRequirements: [
    'Strong React experience in a production SaaS environment',
    'Familiarity with design systems and accessible component libraries',
    'Experience improving web performance and Core Web Vitals',
    'Collaboration with product, design, and QA teams',
  ],
  matchingSkills: [
    'React',
    'JavaScript',
    'Vite',
    'Accessibility',
    'Design systems',
    'Performance optimization',
  ],
  missingOrUnverified: [
    'Experience with GraphQL in a production application',
    'Formal experience working with marketing technology integrations',
  ],
  relevantExperience: [
    {
      id: 1,
      title: 'Frontend Engineer — Brightpath Software',
      match: '4 years of production React work, including a shared component library and performance improvements.',
    },
    {
      id: 2,
      title: 'Accessible Job Board UI',
      match: 'Personal project demonstrating keyboard and screen reader usability in a filterable interface.',
    },
  ],
  importantKeywords: [
    'React',
    'Design system',
    'Component library',
    'Accessibility',
    'Core Web Vitals',
    'Cross-functional collaboration',
  ],
};

export const applicationPackage = {
  company: 'Northwind Labs',
  jobTitle: 'Frontend Engineer',
  coverLetterBody: [
    'I’m excited to apply for the Frontend Engineer position at Northwind Labs. My background aligns closely with the team’s focus on accessible design systems and high-performance React applications.',
    'At Brightpath Software, I lead the implementation of a React component library used by eight product teams. I also reduced average page load time by 34% through code splitting and image optimization, and worked directly with designers to make our form system meet WCAG AA standards.',
    'I’m especially drawn to Northwind Labs because your platform helps job seekers present their best professional story. I would welcome the chance to bring my experience in accessible UI, performance, and cross-functional collaboration to your engineering team.',
  ],
  applicationNotes: [
    'Tailored the resume toward accessible design systems and React performance work.',
    'Used keywords from the job description such as “design system,” “component library,” and “Core Web Vitals.”',
    'Recommended talking point: ask about the team’s current accessibility testing process.',
  ],
};