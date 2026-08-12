export interface Environment {
  DATABASE_URL: string | undefined;
  PROTOTYPE_ADMIN_PASSWORD: string | undefined;
  GITHUB_APP_ID: string | undefined;
  GITHUB_PRIVATE_KEY: string | undefined;
  GITHUB_WEBHOOK_SECRET: string | undefined;
  GITHUB_INSTALLATION_ID: string | undefined;
  GITHUB_TARGET_PROJECT_NODE_ID: string | undefined;
}

export const env: Environment = {
  DATABASE_URL: process.env.DATABASE_URL,
  PROTOTYPE_ADMIN_PASSWORD: process.env.PROTOTYPE_ADMIN_PASSWORD,
  GITHUB_APP_ID: process.env.GITHUB_APP_ID,
  GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
  GITHUB_INSTALLATION_ID: process.env.GITHUB_INSTALLATION_ID,
  GITHUB_TARGET_PROJECT_NODE_ID: process.env.GITHUB_TARGET_PROJECT_NODE_ID,
};
