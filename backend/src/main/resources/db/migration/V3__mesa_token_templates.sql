-- =====================================================================================
-- V3 — Biblioteca de tokens da mesa (templates pré-carregados)
-- =====================================================================================
-- Cada mesa ganha uma "biblioteca": moldes de token (nome + arte) que o usuário pré-carrega
-- e depois coloca na mesa quantas vezes quiser (vira mesa_tokens). Sem posição. Tipos espelham
-- TokenTemplateJpaEntity (varchar(36) p/ ids) para passar no ddl-auto=validate.
-- =====================================================================================

CREATE TABLE `mesa_token_templates` (
  `id` varchar(36) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `imagem_url` varchar(512) DEFAULT NULL,
  `mesa_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesa_token_templates_mesa` (`mesa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
