package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto;

/** urlUpload = PUT pré-assinado (efêmero); urlPublica = onde a imagem será lida depois. */
public record UploadUrlResponse(String urlUpload, String urlPublica) {}
