/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string | undefined;
  // add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 