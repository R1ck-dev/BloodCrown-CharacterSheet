-- =====================================================================================
-- V1 — Baseline do schema BloodCrown (pré-Flyway)
-- =====================================================================================
-- Este script representa o schema que o Hibernate (ddl-auto=update) já gerou. Colunas e
-- tipos são uma cópia fiel do DDL que o Hibernate produz a partir das *JpaEntity (enums
-- nativos, TEXT, bit(1), int default 1), garantindo que `ddl-auto=validate` aceite um banco
-- criado por este baseline.
--
-- IMPORTANTE: em produção (Aiven, banco já populado) este script NÃO roda. Com
-- `spring.flyway.baseline-on-migrate=true` + `baseline-version=1`, o Flyway apenas cria a
-- tabela `flyway_schema_history` e marca a v1 como aplicada. Os CREATE TABLE abaixo só
-- executam em banco vazio (local/CI/novo ambiente). Toda mudança futura entra como V2+.
-- =====================================================================================

-- ---------- users ----------
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(25) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `roles` enum('ROLE_ADMIN','ROLE_USER') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- folders ----------
CREATE TABLE `folders` (
  `id` varchar(36) NOT NULL,
  `name` varchar(60) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- characters ----------
CREATE TABLE `characters` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `char_class` varchar(255) DEFAULT NULL,
  `level` int DEFAULT NULL,
  `money` varchar(255) DEFAULT NULL,
  `heroi_point` int DEFAULT NULL,
  `biography` text,
  -- atributos
  `forca` int DEFAULT NULL,
  `destreza` int DEFAULT NULL,
  `sabedoria` int DEFAULT NULL,
  `inteligencia` int DEFAULT NULL,
  `carisma` int DEFAULT NULL,
  `constituicao` int DEFAULT NULL,
  -- status / recursos vitais e defesas
  `max_health` int DEFAULT NULL,
  `current_health` int DEFAULT NULL,
  `max_sanity` int DEFAULT NULL,
  `current_sanity` int DEFAULT NULL,
  `max_mana` int DEFAULT NULL,
  `current_mana` int DEFAULT NULL,
  `max_stamina` int DEFAULT NULL,
  `current_stamina` int DEFAULT NULL,
  `defense` int DEFAULT NULL,
  `defense_base` int DEFAULT NULL,
  `armor_bonus` int DEFAULT NULL,
  `other_bonus` int DEFAULT NULL,
  `physical_res` int DEFAULT NULL,
  `magical_res` int DEFAULT NULL,
  -- perícias fixas
  `atletismo` int DEFAULT NULL,
  `luta` int DEFAULT NULL,
  `pontaria` int DEFAULT NULL,
  `reflexos` int DEFAULT NULL,
  `fortitude` int DEFAULT NULL,
  `furtividade` int DEFAULT NULL,
  `conhecimento` int DEFAULT NULL,
  `investigacao` int DEFAULT NULL,
  `medicina` int DEFAULT NULL,
  `mente` int DEFAULT NULL,
  `magia` int DEFAULT NULL,
  `percepcao` int DEFAULT NULL,
  `intuicao` int DEFAULT NULL,
  `empatia` int DEFAULT NULL,
  `diplomacia` int DEFAULT NULL,
  `intimidar` int DEFAULT NULL,
  `labia` int DEFAULT NULL,
  `seduzir` int DEFAULT NULL,
  `consertar` int DEFAULT NULL,
  `domar` int DEFAULT NULL,
  `iniciativa` int DEFAULT NULL,
  `ladinagem` int DEFAULT NULL,
  `sobrevivencia` int DEFAULT NULL,
  -- pool de ações
  `max_standard` int DEFAULT NULL,
  `current_standard` int DEFAULT NULL,
  `max_bonus` int DEFAULT NULL,
  `current_bonus` int DEFAULT NULL,
  `max_movement` int DEFAULT NULL,
  `current_movement` int DEFAULT NULL,
  `max_reaction` int DEFAULT NULL,
  `current_reaction` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- attacks ----------
CREATE TABLE `attacks` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `damage_dice` varchar(255) DEFAULT NULL,
  `description` text,
  `character_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- abilities ----------
CREATE TABLE `abilities` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `resource_type` enum('HYBRID','MANA','STAMINA') DEFAULT NULL,
  `action_type` varchar(255) DEFAULT NULL,
  `max_uses` int DEFAULT NULL,
  `current_uses` int DEFAULT NULL,
  `dice_roll` varchar(255) DEFAULT NULL,
  `duration_dice` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `turns_remaining` int DEFAULT NULL,
  `description` text,
  `character_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- ability_effects ----------
CREATE TABLE `ability_effects` (
  `id` varchar(255) NOT NULL,
  `target_attribute` varchar(255) DEFAULT NULL,
  `effect_value` int DEFAULT NULL,
  `ability_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- items ----------
CREATE TABLE `items` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `is_equipped` bit(1) DEFAULT NULL,
  `target_attribute` varchar(255) DEFAULT NULL,
  `effect_value` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `use_dice` varchar(255) DEFAULT NULL,
  `character_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- custom_skills ----------
CREATE TABLE `custom_skills` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `attribute` varchar(255) DEFAULT NULL,
  `skill_value` int DEFAULT NULL,
  `character_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- chaves estrangeiras (conjunto completo derivado das @ManyToOne) ----------
ALTER TABLE `folders`
  ADD CONSTRAINT `fk_folders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `characters`
  ADD CONSTRAINT `fk_characters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_characters_folder` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`id`);

ALTER TABLE `attacks`
  ADD CONSTRAINT `fk_attacks_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`);

ALTER TABLE `abilities`
  ADD CONSTRAINT `fk_abilities_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`);

ALTER TABLE `ability_effects`
  ADD CONSTRAINT `fk_ability_effects_ability` FOREIGN KEY (`ability_id`) REFERENCES `abilities` (`id`);

ALTER TABLE `items`
  ADD CONSTRAINT `fk_items_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`);

ALTER TABLE `custom_skills`
  ADD CONSTRAINT `fk_custom_skills_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`);
