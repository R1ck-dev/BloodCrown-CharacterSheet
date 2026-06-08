-- =====================================================================================
-- V7 — Vínculo token <-> ficha (Character) + visibilidade do status no token
-- =====================================================================================
-- Fase 2 do tabletop: o token deixa de ser "entidade solta" e passa a poder apontar para uma
-- ficha (`character_id`), de onde o tabuleiro lê o snapshot de status (vida/defesa/resistências)
-- para desenhar a barra/selos embaixo do token. `status_visivel` espelha `nome_visivel`: permite
-- esconder o status por token (padrão: visível). Tipos espelham as *JpaEntity (varchar(36) p/ id,
-- bit(1) p/ boolean) para passar no `ddl-auto=validate`.
--
-- `character_id` é String solta (NÃO FK JPA), seguindo o padrão de `template_id`/`cena_id`. O index
-- serve a busca por characterId usada no broadcast ao vivo de status e no card de rolagem.
-- Em banco vazio (local/CI) o ALTER apenas adiciona as colunas; em prod, aplica os defaults nas
-- linhas existentes (tokens já criados nascem com status visível e sem ficha vinculada).
-- =====================================================================================

ALTER TABLE `mesa_tokens`
  ADD COLUMN `character_id` varchar(36) DEFAULT NULL,
  ADD COLUMN `status_visivel` bit(1) NOT NULL DEFAULT b'1';

CREATE INDEX `idx_mesa_tokens_character` ON `mesa_tokens` (`character_id`);
