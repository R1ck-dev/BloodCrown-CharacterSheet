package br.com.henrique.bloodcrown_cs.Config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Habilita @Cacheable / @CacheEvict / @CachePut em servicos.
 * Provider e politica de eviction vem do application.properties
 * (spring.cache.type=caffeine + spring.cache.caffeine.spec).
 */
@Configuration
@EnableCaching
public class CacheConfig {
}
