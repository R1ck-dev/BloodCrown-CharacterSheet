package br.com.henrique.bloodcrown_cs.infrastructure.web.character.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.application.character.dto.CustomSkillInput;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AdicionarPericiaCustomizadaUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AtualizarPericiaCustomizadaUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.RemoverPericiaCustomizadaUseCase;
import br.com.henrique.bloodcrown_cs.domain.character.model.CustomSkill;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CustomSkillDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.mapper.CharacterWebMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/custom-skills")
@RequiredArgsConstructor
public class CustomSkillController {

    private final AdicionarPericiaCustomizadaUseCase adicionarPericia;
    private final AtualizarPericiaCustomizadaUseCase atualizarPericia;
    private final RemoverPericiaCustomizadaUseCase removerPericia;
    private final CharacterWebMapper webMapper;

    @PostMapping("/{characterId}")
    public ResponseEntity<CustomSkillDto> add(@PathVariable String characterId, @RequestBody CustomSkillDto dto,
                                              @AuthenticationPrincipal String userId) {
        CustomSkill skill = adicionarPericia.execute(characterId, userId,
                new CustomSkillInput(dto.name(), dto.attribute(), dto.value()));
        CustomSkillDto body = webMapper.toCustomSkillDto(skill);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}").buildAndExpand(skill.getId()).toUri();
        return ResponseEntity.created(location).body(body);
    }

    @PutMapping("/{customSkillId}")
    public ResponseEntity<CustomSkillDto> update(@PathVariable String customSkillId, @RequestBody CustomSkillDto dto,
                                                 @AuthenticationPrincipal String userId) {
        CustomSkill skill = atualizarPericia.execute(customSkillId, userId,
                new CustomSkillInput(dto.name(), dto.attribute(), dto.value()));
        return ResponseEntity.ok(webMapper.toCustomSkillDto(skill));
    }

    @DeleteMapping("/{customSkillId}")
    public ResponseEntity<Void> delete(@PathVariable String customSkillId, @AuthenticationPrincipal String userId) {
        removerPericia.execute(customSkillId, userId);
        return ResponseEntity.noContent().build();
    }
}
