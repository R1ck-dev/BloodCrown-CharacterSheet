-- =====================================================================================
-- V4 — Pastas na biblioteca + versões de token + vínculo token↔template
-- =====================================================================================
-- 1) Pastas (um nível) pra organizar os templates da biblioteca de cada mesa.
-- 2) Template ganha base_id (é versão de outro template) e pasta_id (organização).
-- 3) Token colocado ganha template_id (qual template/versão ele representa) p/ troca rápida.
-- Tipos espelham as *JpaEntity (varchar(36) p/ ids) para passar no ddl-auto=validate.
-- =====================================================================================

CREATE TABLE `mesa_biblioteca_pastas` (
  `id` varchar(36) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `mesa_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesa_biblioteca_pastas_mesa` (`mesa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `mesa_token_templates`
  ADD COLUMN `base_id` varchar(36) DEFAULT NULL,
  ADD COLUMN `pasta_id` varchar(36) DEFAULT NULL;

ALTER TABLE `mesa_tokens`
  ADD COLUMN `template_id` varchar(36) DEFAULT NULL;
