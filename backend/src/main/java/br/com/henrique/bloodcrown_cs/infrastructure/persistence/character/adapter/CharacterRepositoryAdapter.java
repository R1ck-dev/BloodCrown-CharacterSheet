package br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.adapter;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.mapper.CharacterMapper;
import br.com.henrique.bloodcrown_cs.infrastructure.persistence.character.repository.SpringDataCharacterRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CharacterRepositoryAdapter implements CharacterRepository {

    private final SpringDataCharacterRepository springDataCharacterRepository;
    private final CharacterMapper characterMapper;

    @Override
    public Character salvar(Character character) {
        return characterMapper.toDomain(
            springDataCharacterRepository.save(characterMapper.toEntity(character)));
    }

    @Override
    public Optional<Character> buscarPorIdEUsuario(String id, String userId) {
        return springDataCharacterRepository.findByIdAndUser_Id(id, userId).map(characterMapper::toDomain);
    }

    @Override
    public List<Character> buscarPorUsuario(String userId) {
        return springDataCharacterRepository.findByUser_Id(userId).stream()
                .map(characterMapper::toDomain)
                .toList();
    }

    @Override
    public List<Character> buscarPorPastaEUsuario(String folderId, String userId) {
        return springDataCharacterRepository.findByFolder_IdAndUser_Id(folderId, userId).stream()
                .map(characterMapper::toDomain)
                .toList();
    }

    @Override
    public void deletar(String id) {
        springDataCharacterRepository.deleteById(id);
    }

    @Override
    public Optional<Character> buscarPorAtaqueIdEUsuario(String attackId, String userId) {
        return springDataCharacterRepository.findByAttacks_IdAndUser_Id(attackId, userId).map(characterMapper::toDomain);
    }

    @Override
    public Optional<Character> buscarPorHabilidadeIdEUsuario(String abilityId, String userId) {
        return springDataCharacterRepository.findByAbilities_IdAndUser_Id(abilityId, userId).map(characterMapper::toDomain);
    }

    @Override
    public Optional<Character> buscarPorItemIdEUsuario(String itemId, String userId) {
        return springDataCharacterRepository.findByInventory_IdAndUser_Id(itemId, userId).map(characterMapper::toDomain);
    }

    @Override
    public Optional<Character> buscarPorPericiaCustomizadaIdEUsuario(String customSkillId, String userId) {
        return springDataCharacterRepository.findByCustomSkills_IdAndUser_Id(customSkillId, userId).map(characterMapper::toDomain);
    }
}
