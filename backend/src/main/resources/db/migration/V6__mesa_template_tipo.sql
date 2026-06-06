-- =====================================================================================
-- V6 — Tipo do item da biblioteca da mesa (token | mapa | documento)
-- =====================================================================================
-- A biblioteca passa a guardar três tipos de imagem, exibidos/filtrados por seção:
--   TOKEN     — molde de criatura/PJ colocado na mesa como token (comportamento atual);
--   MAPA      — imagem aplicada como mapa da cena ativa;
--   DOCUMENTO — handout/lore colocado no tabuleiro como imagem.
-- Itens já existentes viram TOKEN (DEFAULT). Espelha TokenTemplateJpaEntity.tipo
-- (varchar(20) NOT NULL) para passar no ddl-auto=validate.
-- =====================================================================================

ALTER TABLE `mesa_token_templates`
  ADD COLUMN `tipo` varchar(20) NOT NULL DEFAULT 'TOKEN';
