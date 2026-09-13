export const SKILL_ALIASES = {
  'amazon web services': 'aws',
  'aws cloud': 'aws',
  'amazon cloud': 'aws',

  'microsoft azure': 'azure',
  'azure cloud': 'azure',

  'google cloud platform': 'gcp',
  'google cloud': 'gcp',

  'javascript': 'javascript',
  'java script': 'javascript',
  'ecmascript': 'javascript',
  js: 'javascript',

  'node.js': 'node.js',
  nodejs: 'node.js',
  'node js': 'node.js',

  'react.js': 'react',
  reactjs: 'react',

  'next.js': 'next.js',
  nextjs: 'next.js',

  'vue.js': 'vue',
  vuejs: 'vue',

  'postgres': 'postgresql',
  postgresql: 'postgresql',

  'microsoft sql server': 'sql server',
  'ms sql server': 'sql server',
  mssql: 'sql server',

  'k8s': 'kubernetes',
  kubernetes: 'kubernetes',

  'docker container': 'docker',
  docker: 'docker',

  'terraform': 'terraform',
  tf: 'terraform',

  'python': 'python',
  py: 'python',

  'golang': 'go',
  'go language': 'go',

  'typescript': 'typescript',
  ts: 'typescript',

  'c sharp': 'c#',
  csharp: 'c#',

  'objective c': 'objective-c',
  objectivec: 'objective-c',

  'f sharp': 'f#',
  fsharp: 'f#',

  'rest api': 'rest api',
  restful: 'rest api',

  'graphql api': 'graphql',
  graphql: 'graphql',

  'continuous integration': 'ci',
  'continuous deployment': 'cd',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',
};

export const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'using',
  'experience',
  'development',
  'developer',
  'engineer',
  'engineering',
  'software',
  'application',
  'applications',
  'system',
  'systems',
  'working',
  'work',
  'role',
  'roles',
  'knowledge',
  'familiarity',
  'must',
  'have',
  'plus',
  'strong',
  'ability',
  'skills',
  'skill',
  'experience',
  'responsible',
  'responsibilities',
  'team',
  'environment',
  'agile',
  'understanding',
  'building',
  'build',
  'managing',
  'manage',
  'creating',
  'create',
  'designing',
  'design',
  'implement',
  'implementation',
  'required',
  'preferred',
  'nice',
]);

export function canonicalizeSkill(value) {
  if (!value) return '';

  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return SKILL_ALIASES[normalized] || normalized;
}