/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloud name do Cloudinary (não-secreto) — upload de mapas/tokens. */
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  /** Nome do "unsigned upload preset" do Cloudinary (não-secreto). */
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
