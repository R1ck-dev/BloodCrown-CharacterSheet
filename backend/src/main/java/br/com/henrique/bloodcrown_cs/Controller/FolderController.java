package br.com.henrique.bloodcrown_cs.Controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.com.henrique.bloodcrown_cs.DTOs.FolderDTO;
import br.com.henrique.bloodcrown_cs.Services.FolderService;

/**
 * Endpoints de pastas de organizacao de fichas.
 * Todas as rotas exigem autenticacao (filtro global) e validam ownership no service.
 */
@RestController
@RequestMapping("/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @GetMapping
    public ResponseEntity<List<FolderDTO>> list(Authentication authentication) {
        return ResponseEntity.ok(folderService.listFolders(authentication));
    }

    @PostMapping
    public ResponseEntity<FolderDTO> create(@RequestBody FolderDTO dto, Authentication authentication) {
        FolderDTO created = folderService.createFolder(dto, authentication);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderDTO> rename(@PathVariable String id, @RequestBody FolderDTO dto, Authentication authentication) {
        return ResponseEntity.ok(folderService.renameFolder(id, dto, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        folderService.deleteFolder(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
