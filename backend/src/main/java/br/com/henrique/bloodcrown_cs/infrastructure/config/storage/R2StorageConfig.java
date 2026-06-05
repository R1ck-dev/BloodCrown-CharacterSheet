package br.com.henrique.bloodcrown_cs.infrastructure.config.storage;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * Cliente de presign do Cloudflare R2 (S3-compatível). Region "auto" (padrão do R2) e
 * path-style habilitado. As credenciais vêm de env em prod (APP_STORAGE_R2_*); placeholders
 * locais permitem o boot/presign offline sem R2 real. Lazy-init: só nasce quando usado.
 */
@Configuration
public class R2StorageConfig {

    @Bean(destroyMethod = "close")
    public S3Presigner s3Presigner(
            @Value("${app.storage.r2.endpoint}") String endpoint,
            @Value("${app.storage.r2.access-key}") String accessKey,
            @Value("${app.storage.r2.secret-key}") String secretKey) {
        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }
}
