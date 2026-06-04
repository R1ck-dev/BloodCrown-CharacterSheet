package br.com.henrique.bloodcrown_cs.infrastructure.web.character.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.application.character.dto.EffectInput;
import br.com.henrique.bloodcrown_cs.application.character.dto.HabilidadeInput;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AdicionarHabilidadeUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AlternarHabilidadeUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AtualizarHabilidadeUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AvancarTurnoUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.RecuperarUsoHabilidadeUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.RemoverHabilidadeUseCase;
import br.com.henrique.bloodcrown_cs.domain.character.enums.ActionType;
import br.com.henrique.bloodcrown_cs.domain.character.model.Ability;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.AbilityDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterSheetDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.mapper.CharacterWebMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/abilities")
@RequiredArgsConstructor
public class AbilityController {

    private final AdicionarHabilidadeUseCase adicionarHabilidade;
    private final AtualizarHabilidadeUseCase atualizarHabilidade;
    private final RemoverHabilidadeUseCase removerHabilidade;
    private final AlternarHabilidadeUseCase alternarHabilidade;
    private final AvancarTurnoUseCase avancarTurno;
    private final RecuperarUsoHabilidadeUseCase recuperarUso;
    private final CharacterWebMapper webMapper;

    @PostMapping("/{id}")
    public ResponseEntity<AbilityDto> add(@PathVariable String id, @RequestBody AbilityDto dto,
                                          @AuthenticationPrincipal String userId) {
        Ability ability = adicionarHabilidade.execute(id, userId, toInput(dto));
        AbilityDto body = webMapper.toAbilityDto(ability);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}").buildAndExpand(ability.getId()).toUri();
        return ResponseEntity.created(location).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AbilityDto> update(@PathVariable String id, @RequestBody AbilityDto dto,
                                             @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toAbilityDto(atualizarHabilidade.execute(id, userId, toInput(dto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal String userId) {
        removerHabilidade.execute(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{abilityId}/toggle")
    public ResponseEntity<CharacterSheetDto> toggle(@PathVariable String abilityId,
                                                    @RequestParam(required = false) ActionType spendAs,
                                                    @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toSheet(alternarHabilidade.execute(abilityId, userId, spendAs)));
    }

    @PostMapping("/next-turn/{characterId}")
    public ResponseEntity<CharacterSheetDto> advanceTurn(@PathVariable String characterId,
                                                         @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toSheet(avancarTurno.execute(characterId, userId)));
    }

    @PostMapping("/{abilityId}/recover")
    public ResponseEntity<CharacterSheetDto> recover(@PathVariable String abilityId,
                                                     @RequestParam(defaultValue = "MANA") String resource,
                                                     @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toSheet(recuperarUso.execute(abilityId, userId, resource)));
    }

    private HabilidadeInput toInput(AbilityDto dto) {
        List<EffectInput> effects = dto.effects() != null
                ? dto.effects().stream().map(e -> new EffectInput(e.target(), e.value())).toList()
                : null;
        return new HabilidadeInput(dto.name(), dto.category(), dto.resourceType(), dto.actionType(),
                dto.maxUses(), dto.diceRoll(), effects, dto.durationDice(), dto.description());
    }
}
