package br.com.henrique.bloodcrown_cs.infrastructure.config.cache;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Habilita @Cacheable / @CacheEvict nos use cases. Provider e política de eviction vêm
 * do application.properties (spring.cache.type=caffeine + spring.cache.caffeine.spec).
 */
@Configuration
@EnableCaching
public class CacheConfig {
}
