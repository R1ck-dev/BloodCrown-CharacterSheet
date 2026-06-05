package br.com.henrique.bloodcrown_cs.infrastructure.persistence.storage;

import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.mesa.port.MediaStoragePort;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * Adapter de storage sobre o Cloudflare R2. Gera um PUT pré-assinado (válido 10 min) pro
 * cliente subir o mapa direto no bucket, e devolve a URL pública de leitura. O byte nunca
 * passa pelo backend nem pelo banco. A contentType assinada precisa bater com a do PUT do
 * cliente, senão a assinatura falha.
 */
@Component
@RequiredArgsConstructor
public class R2MediaStorageAdapter implements MediaStoragePort {

    private static final Duration VALIDADE = Duration.ofMinutes(10);

    private final S3Presigner s3Presigner;

    @Value("${app.storage.r2.bucket}")
    private String bucket;

    @Value("${app.storage.r2.public-base-url}")
    private String publicBaseUrl;

    @Override
    public UploadAlvo gerarUrlUploadMapa(String mesaId, String contentType) {
        String tipo = (contentType != null && !contentType.isBlank()) ? contentType : "image/png";
        String chave = "mapas/" + mesaId + "/" + UUID.randomUUID() + extensao(tipo);

        PutObjectRequest objeto = PutObjectRequest.builder()
                .bucket(bucket)
                .key(chave)
                .contentType(tipo)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(VALIDADE)
                .putObjectRequest(objeto)
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);

        String base = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return new UploadAlvo(presigned.url().toString(), base + "/" + chave);
    }

    private String extensao(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
    }
}
