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

import br.com.henrique.bloodcrown_cs.application.character.dto.AtaqueInput;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AdicionarAtaqueUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AtualizarAtaqueUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.RemoverAtaqueUseCase;
import br.com.henrique.bloodcrown_cs.domain.character.model.Attack;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.AttackDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.mapper.CharacterWebMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/attacks")
@RequiredArgsConstructor
public class AttackController {

    private final AdicionarAtaqueUseCase adicionarAtaque;
    private final AtualizarAtaqueUseCase atualizarAtaque;
    private final RemoverAtaqueUseCase removerAtaque;
    private final CharacterWebMapper webMapper;

    @PostMapping("/{id}")
    public ResponseEntity<AttackDto> add(@PathVariable String id, @RequestBody AttackDto dto,
                                         @AuthenticationPrincipal String userId) {
        Attack attack = adicionarAtaque.execute(id, userId,
                new AtaqueInput(dto.name(), dto.damageDice(), dto.description()));
        AttackDto body = webMapper.toAttackDto(attack);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}").buildAndExpand(attack.getId()).toUri();
        return ResponseEntity.created(location).body(body);
    }

    @PutMapping("/{attackId}")
    public ResponseEntity<AttackDto> update(@PathVariable String attackId, @RequestBody AttackDto dto,
                                            @AuthenticationPrincipal String userId) {
        Attack attack = atualizarAtaque.execute(attackId, userId,
                new AtaqueInput(dto.name(), dto.damageDice(), dto.description()));
        return ResponseEntity.ok(webMapper.toAttackDto(attack));
    }

    @DeleteMapping("/{attackId}")
    public ResponseEntity<Void> delete(@PathVariable String attackId, @AuthenticationPrincipal String userId) {
        removerAtaque.execute(attackId, userId);
        return ResponseEntity.noContent().build();
    }
}
