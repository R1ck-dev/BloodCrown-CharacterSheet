/**
 * Upload de imagem direto pro Cloudinary via "unsigned upload preset".
 * O navegador sobe o arquivo SEM passar pelo backend e recebe a secure_url pública,
 * que o front então grava na mesa (PUT /mesas/{id}/mapa). Cloud name + preset NÃO são
 * segredos — vão nas envs VITE_CLOUDINARY_* (local em .env.local, prod no painel do Netlify).
 * Crie o preset como "Unsigned" no painel: Settings → Upload → Upload presets.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/** True se as duas envs estão presentes (habilita o botão Upload). */
export function cloudinaryConfigurado(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** Sobe a imagem e devolve a secure_url. Lança erro com mensagem amigável se falhar. */
export async function uploadImagemCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Upload não configurado (defina VITE_CLOUDINARY_CLOUD_NAME e _UPLOAD_PRESET).');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Upload Cloudinary falhou (${resp.status}). ${txt}`.trim());
  }

  const data = (await resp.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error('Cloudinary não retornou a URL da imagem.');
  }
  return data.secure_url;
}
