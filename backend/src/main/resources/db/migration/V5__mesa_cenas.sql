-- =====================================================================================
-- V5 — Cenas da mesa (vários mapas) + nome visível por token
-- =====================================================================================
-- Cada mesa passa a ter VÁRIAS cenas; cada cena é um mapa com seu próprio grid, escala de
-- medição e transformação (posição/tamanho/trava como fundo). O mapa+grid que viviam em `mesas`
-- migram para a 1ª cena de cada mesa; os tokens existentes são religados a essa cena. Os tokens
-- ganham `nome_visivel` (nome embaixo do token). Tipos espelham as *JpaEntity (varchar(36) p/ ids,
-- bit(1) p/ boolean, int p/ posições, double p/ escala) para passar no `ddl-auto=validate`.
--
-- Em banco vazio (local/CI) os passos de dados (INSERT/UPDATE ... SELECT) simplesmente afetam 0
-- linhas. Em prod, criam uma cena "Cena 1" por mesa e religam os tokens antes de soltar as
-- colunas antigas de `mesas`.
-- =====================================================================================

-- ---------- mesa_cenas ----------
CREATE TABLE `mesa_cenas` (
  `id` varchar(36) NOT NULL,
  `mesa_id` varchar(36) DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `ordem` int NOT NULL DEFAULT 0,
  `mapa_url` varchar(512) DEFAULT NULL,
  `grid_cell_size` int NOT NULL DEFAULT 50,
  `grid_visivel` bit(1) NOT NULL DEFAULT b'1',
  `grid_cor` varchar(20) DEFAULT NULL,
  `escala_valor` double NOT NULL DEFAULT 1.5,
  `escala_unidade` varchar(20) DEFAULT NULL,
  `mapa_x` int NOT NULL DEFAULT 0,
  `mapa_y` int NOT NULL DEFAULT 0,
  `mapa_largura` int NOT NULL DEFAULT 0,
  `mapa_altura` int NOT NULL DEFAULT 0,
  `mapa_travado` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`),
  KEY `idx_mesa_cenas_mesa` (`mesa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- migra mapa+grid de cada mesa para uma cena inicial ----------
INSERT INTO `mesa_cenas`
  (`id`, `mesa_id`, `nome`, `ordem`, `mapa_url`,
   `grid_cell_size`, `grid_visivel`, `grid_cor`,
   `escala_valor`, `escala_unidade`, `mapa_x`, `mapa_y`, `mapa_largura`, `mapa_altura`, `mapa_travado`)
SELECT UUID(), m.`id`, 'Cena 1', 0, m.`mapa_url`,
       m.`grid_cell_size`, m.`grid_visivel`, m.`grid_cor`,
       1.5, 'm', 0, 0, 0, 0, b'1'
FROM `mesas` m;

-- ---------- mesas: cena ativa aponta para a cena inicial ----------
ALTER TABLE `mesas`
  ADD COLUMN `cena_ativa_id` varchar(36) DEFAULT NULL;

UPDATE `mesas` m
SET m.`cena_ativa_id` = (SELECT c.`id` FROM `mesa_cenas` c WHERE c.`mesa_id` = m.`id` LIMIT 1);

-- ---------- mesa_tokens: religa à cena inicial + nome visível ----------
ALTER TABLE `mesa_tokens`
  ADD COLUMN `cena_id` varchar(36) DEFAULT NULL,
  ADD COLUMN `nome_visivel` bit(1) NOT NULL DEFAULT b'1';

UPDATE `mesa_tokens` t
SET t.`cena_id` = (SELECT c.`id` FROM `mesa_cenas` c WHERE c.`mesa_id` = t.`mesa_id` LIMIT 1);

-- ---------- mesas: solta as colunas que migraram para mesa_cenas ----------
ALTER TABLE `mesas`
  DROP COLUMN `mapa_url`,
  DROP COLUMN `grid_cell_size`,
  DROP COLUMN `grid_visivel`,
  DROP COLUMN `grid_cor`;
