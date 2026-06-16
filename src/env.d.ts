/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    authed: boolean;
  }
}

interface ImportMetaEnv {
  readonly ADMIN_PASSWORD: string;
  readonly SESSION_SECRET: string;
  readonly TURSO_DATABASE_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
