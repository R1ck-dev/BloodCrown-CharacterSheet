package br.com.henrique.bloodcrown_cs.infrastructure.web.character.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.application.character.dto.AtualizarPersonagemInput;
import br.com.henrique.bloodcrown_cs.application.character.dto.PatchPersonagemInput;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AtualizarPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.BroadcastRolagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.BuscarPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.CriarPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.DeletarPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.DescansarPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.ListarPersonagensUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.MoverPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.PatchPersonagemUseCase;
import br.com.henrique.bloodcrown_cs.domain.character.model.Character;
import br.com.henrique.bloodcrown_cs.domain.character.model.RolagemPayload;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterPatchDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterSheetDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterSummaryDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.MoveToFolderRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.RolagemMesaRequest;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.mapper.CharacterWebMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final ListarPersonagensUseCase listarPersonagens;
    private final CriarPersonagemUseCase criarPersonagem;
    private final BuscarPersonagemUseCase buscarPersonagem;
    private final AtualizarPersonagemUseCase atualizarPersonagem;
    private final PatchPersonagemUseCase patchPersonagem;
    private final DeletarPersonagemUseCase deletarPersonagem;
    private final DescansarPersonagemUseCase descansarPersonagem;
    private final MoverPersonagemUseCase moverPersonagem;
    private final BroadcastRolagemUseCase broadcastRolagem;
    private final CharacterWebMapper webMapper;

    @GetMapping
    public ResponseEntity<List<CharacterSummaryDto>> list(@AuthenticationPrincipal String userId) {
        List<CharacterSummaryDto> response = listarPersonagens.execute(userId).stream()
                .map(webMapper::toSummary).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CharacterSummaryDto> create(@AuthenticationPrincipal String userId) {
        Character created = criarPersonagem.execute(userId);
        CharacterSummaryDto body = webMapper.toSummary(created);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CharacterSheetDto> get(@PathVariable String id, @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toSheet(buscarPersonagem.execute(id, userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CharacterSheetDto> update(@PathVariable String id, @RequestBody CharacterSheetDto body,
                                                    @AuthenticationPrincipal String userId) {
        AtualizarPersonagemInput input = new AtualizarPersonagemInput(
            body.name(), body.characterClass(), body.level(), body.money(), body.heroPoint(), body.biography(),
            webMapper.toAttributesDomain(body.attributes()), webMapper.toStatusDomain(body.status()),
            webMapper.toExpertiseDomain(body.expertise()), webMapper.toActionPoolDomain(body.actionPool()));
        return ResponseEntity.ok(webMapper.toSheet(atualizarPersonagem.execute(id, userId, input)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CharacterSheetDto> patch(@PathVariable String id, @RequestBody CharacterPatchDto body,
                                                   @AuthenticationPrincipal String userId) {
        PatchPersonagemInput input = new PatchPersonagemInput(
            body.name(), body.characterClass(), body.level(), body.money(), body.heroPoint(), body.biography(),
            webMapper.toAttributesDomain(body.attributes()), webMapper.toStatusDomain(body.status()),
            webMapper.toExpertiseDomain(body.expertise()), webMapper.toActionPoolDomain(body.actionPool()));
        return ResponseEntity.ok(webMapper.toSheet(patchPersonagem.execute(id, userId, input)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal String userId) {
        deletarPersonagem.execute(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rest")
    public ResponseEntity<CharacterSheetDto> rest(@PathVariable String id, @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toSheet(descansarPersonagem.execute(id, userId)));
    }

    @PostMapping("/{id}/rolagem-mesa")
    public ResponseEntity<Void> broadcastRolagem(@PathVariable String id, @RequestBody RolagemMesaRequest body,
                                                 @AuthenticationPrincipal String userId) {
        broadcastRolagem.execute(id, userId,
                new RolagemPayload(body.source(), body.total(), body.kind(), body.critico()));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/folder")
    public ResponseEntity<Void> moveToFolder(@PathVariable String id, @RequestBody MoveToFolderRequest body,
                                             @AuthenticationPrincipal String userId) {
        moverPersonagem.execute(id, userId, body == null ? null : body.folderId());
        return ResponseEntity.noContent().build();
    }
}
