package br.com.henrique.bloodcrown_cs.Services;

import org.springframework.security.core.Authentication;

import br.com.henrique.bloodcrown_cs.DTOs.AttackDTO;

public interface AttackService {
    AttackDTO addAttack(String characterId, AttackDTO dto, Authentication authentication);
    void deleteAttack(String attackId);
} 
