export const RELATED_GROUPS = [
  { label: 'cloud platforms', members: ['aws', 'azure', 'gcp'] },
  {
    label: 'containerization',
    members: [
      'docker',
      'podman',
      'kubernetes',
      'docker swarm',
      'nomad',
      'openshift',
    ],
  },
  { label: 'relational databases', members: ['postgresql', 'mysql', 'sql server', 'sqlite', 'oracle db'] },
  { label: 'nosql databases', members: ['mongodb', 'cassandra', 'dynamodb', 'couchdb'] },
  { label: 'frontend frameworks', members: ['react', 'vue', 'angular', 'svelte'] },
  { label: 'backend frameworks', members: ['express', 'fastify', 'nestjs', 'koa', 'spring boot', 'django', 'flask'] },
  { label: 'infrastructure as code', members: ['terraform', 'cloudformation', 'pulumi', 'cdk'] },
  { label: 'configuration management', members: ['ansible', 'chef', 'puppet', 'saltstack'] },
  { label: 'ci/cd platforms', members: ['jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci', 'azure devops'] },
  { label: 'message brokers', members: ['kafka', 'rabbitmq', 'sqs', 'nats'] },
  { label: 'data processing', members: ['spark', 'hadoop', 'flink', 'beam'] },
  { label: 'etl tools', members: ['airflow', 'dbt', 'informatica', 'talend', 'ssis'] },
  { label: 'version control', members: ['git', 'svn', 'mercurial'] },
  { label: 'project management tools', members: ['jira', 'asana', 'trello', 'linear', 'monday'] },
  { label: 'crm platforms', members: ['salesforce', 'hubspot', 'zoho crm', 'pipedrive'] },
  { label: 'erp systems', members: ['sap', 'oracle erp', 'netsuite', 'microsoft dynamics'] },
  { label: 'bi tools', members: ['tableau', 'power bi', 'looker', 'qlik'] },
];

export const SPECIFIC_TO_GENERIC = {
  postgresql: ['sql', 'relational databases'],
  mysql: ['sql', 'relational databases'],
  'sql server': ['sql', 'relational databases'],
  sqlite: ['sql', 'relational databases'],
  mongodb: ['nosql'],
  cassandra: ['nosql'],
  dynamodb: ['nosql'],

  react: ['javascript', 'frontend development'],
  vue: ['javascript', 'frontend development'],
  angular: ['typescript', 'frontend development'],
  svelte: ['javascript', 'frontend development'],

  'node.js': ['javascript', 'backend development'],
  express: ['node.js', 'backend development'],
  django: ['python', 'backend development'],
  flask: ['python', 'backend development'],
  'spring boot': ['java', 'backend development'],

  docker: ['containerization'],
  kubernetes: ['containerization', 'container orchestration'],
};

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const GROUP_INDEX = (() => {
  const index = new Map();
  for (const group of RELATED_GROUPS) {
    for (const member of group.members) {
      const key = normalizeKey(member);
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(group);
    }
  }
  return index;
})();

export function getRelatedGroups(term) {
  return GROUP_INDEX.get(normalizeKey(term)) || [];
}

export function areRelated(termA, termB) {
  const keyA = normalizeKey(termA);
  const keyB = normalizeKey(termB);
  if (!keyA || !keyB || keyA === keyB) return false;

  const groupsA = GROUP_INDEX.get(keyA) || [];
  const groupsB = GROUP_INDEX.get(keyB) || [];

  return groupsA.some((group) => groupsB.includes(group));
}

export function isSpecificOf(specific, generic) {
  const key = normalizeKey(specific);
  const genericKey = normalizeKey(generic);
  const generics = SPECIFIC_TO_GENERIC[key];
  if (!generics) return false;
  return generics.map(normalizeKey).includes(genericKey);
}

export function classifyRelationship(profileSkill, requiredSkill) {
  const profileKey = normalizeKey(profileSkill);
  const requiredKey = normalizeKey(requiredSkill);

  if (!profileKey || !requiredKey) return null;
  if (profileKey === requiredKey) return 'EXACT_MATCH';

  if (isSpecificOf(profileSkill, requiredSkill)) return 'TRANSFERABLE';
  if (areRelated(profileSkill, requiredSkill)) return 'RELATED_BUT_DIFFERENT';

  return null;
}