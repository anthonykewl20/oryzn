module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'
    ]],
    'scope-enum': [2, 'always', [
      'acceptance', 'api', 'auth', 'baseline', 'ci', 'db', 'delivery', 'deps', 'docs',
      'github', 'infra', 'ingestion', 'main', 'normalizer', 'persistence', 'phase-2',
      'reconciliation', 'release', 'roadmap', 'schema', 'security', 'setup', 'test',
      'timeline', 'ui', 'webhook'
    ]],
    'scope-case': [2, 'always', 'kebab-case'],
    'header-max-length': [2, 'always', 100]
  }
};
