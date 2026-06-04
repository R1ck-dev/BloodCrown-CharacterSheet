package br.com.henrique.bloodcrown_cs.infrastructure.web.folder.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.application.folder.usecase.CriarPastaUseCase;
import br.com.henrique.bloodcrown_cs.application.folder.usecase.DeletarPastaUseCase;
import br.com.henrique.bloodcrown_cs.application.folder.usecase.ListarPastasUseCase;
import br.com.henrique.bloodcrown_cs.application.folder.usecase.RenomearPastaUseCase;
import br.com.henrique.bloodcrown_cs.domain.folder.model.Folder;
import br.com.henrique.bloodcrown_cs.infrastructure.web.folder.dto.FolderDto;

import lombok.RequiredArgsConstructor;

/**
 * Endpoints de pastas. Todas as rotas exigem autenticação (filtro global) e validam
 * posse nos use cases.
 */
@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
public class FolderController {

    private final ListarPastasUseCase listarPastas;
    private final CriarPastaUseCase criarPasta;
    private final RenomearPastaUseCase renomearPasta;
    private final DeletarPastaUseCase deletarPasta;

    @GetMapping
    public ResponseEntity<List<FolderDto>> list(@AuthenticationPrincipal String userId) {
        List<FolderDto> response = listarPastas.execute(userId).stream()
                .map(f -> new FolderDto(f.getId(), f.getName())).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<FolderDto> create(@RequestBody FolderDto dto, @AuthenticationPrincipal String userId) {
        Folder folder = criarPasta.execute(userId, dto.name());
        FolderDto body = new FolderDto(folder.getId(), folder.getName());
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}").buildAndExpand(folder.getId()).toUri();
        return ResponseEntity.created(location).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderDto> rename(@PathVariable String id, @RequestBody FolderDto dto,
                                            @AuthenticationPrincipal String userId) {
        Folder folder = renomearPasta.execute(id, userId, dto.name());
        return ResponseEntity.ok(new FolderDto(folder.getId(), folder.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal String userId) {
        deletarPasta.execute(id, userId);
        return ResponseEntity.noContent().build();
    }
}
