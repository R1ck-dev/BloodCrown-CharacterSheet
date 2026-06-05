-- =====================================================================================
-- V2 — Mesa tabletop (estilo Owlbear): mesas, tokens e participantes
-- =====================================================================================
-- Novo agregado "mesa": mapa de fundo + grid + tokens arrastáveis sincronizados em tempo
-- real. Tipos espelham as *JpaEntity (varchar(36) p/ ids, bit(1) p/ boolean, int p/ posições)
-- para passar no `ddl-auto=validate`. Em prod (Aiven) roda normalmente como migração nova;
-- em banco vazio (local/CI) cria as três tabelas abaixo.
-- =====================================================================================

-- ---------- mesas ----------
CREATE TABLE `mesas` (
  `id` varchar(36) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `dono_user_id` varchar(36) NOT NULL,
  `mapa_url` varchar(512) DEFAULT NULL,
  `grid_cell_size` int NOT NULL,
  `grid_visivel` bit(1) NOT NULL,
  `grid_cor` varchar(20) DEFAULT NULL,
  `codigo_convite` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mesas_codigo_convite` (`codigo_convite`),
  KEY `idx_mesas_dono` (`dono_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- mesa_tokens ----------
CREATE TABLE `mesa_tokens` (
  `id` varchar(36) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `imagem_url` varchar(512) DEFAULT NULL,
  `cor` varchar(20) DEFAULT NULL,
  `pos_x` int NOT NULL,
  `pos_y` int NOT NULL,
  `tamanho` int NOT NULL,
  `dono_user_id` varchar(36) DEFAULT NULL,
  `mesa_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesa_tokens_mesa` (`mesa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- mesa_participantes (ElementCollection<String>) ----------
CREATE TABLE `mesa_participantes` (
  `mesa_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`mesa_id`, `user_id`),
  KEY `idx_mesa_participantes_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
