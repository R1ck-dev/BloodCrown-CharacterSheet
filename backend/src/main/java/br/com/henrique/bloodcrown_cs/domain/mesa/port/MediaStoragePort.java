package br.com.henrique.bloodcrown_cs.domain.mesa.port;

/**
 * Porta de capacidade para armazenamento de mídia (mapas/tokens) fora do banco.
 * Adapter: R2MediaStorageAdapter (Cloudflare R2, S3-compatível) na infraestrutura.
 * O domínio só conhece "me dê uma URL pra subir e a URL pública resultante".
 */
public interface MediaStoragePort {

    /**
     * Gera uma URL PUT pré-assinada para o cliente subir a imagem direto no storage,
     * mais a URL pública por onde a imagem será lida depois.
     */
    UploadAlvo gerarUrlUploadMapa(String mesaId, String contentType);

    /** URL de upload (PUT pré-assinado, expira) + URL pública de leitura (definitiva). */
    record UploadAlvo(String urlUpload, String urlPublica) {}
}
