package br.com.henrique.bloodcrown_cs.infrastructure.web.character.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.henrique.bloodcrown_cs.application.character.dto.ItemInput;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AdicionarItemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AlternarEquipamentoItemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.AtualizarItemUseCase;
import br.com.henrique.bloodcrown_cs.application.character.usecase.RemoverItemUseCase;
import br.com.henrique.bloodcrown_cs.domain.character.model.Item;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.CharacterSheetDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.dto.ItemDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.character.mapper.CharacterWebMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final AdicionarItemUseCase adicionarItem;
    private final AtualizarItemUseCase atualizarItem;
    private final RemoverItemUseCase removerItem;
    private final AlternarEquipamentoItemUseCase alternarEquipamento;
    private final CharacterWebMapper webMapper;

    @PostMapping("/{characterId}")
    public ResponseEntity<ItemDto> add(@PathVariable String characterId, @RequestBody ItemDto dto,
                                       @AuthenticationPrincipal String userId) {
        Item item = adicionarItem.execute(characterId, userId,
                new ItemInput(dto.name(), dto.description(), dto.targetAttribute(), dto.effectValue(),
                        dto.quantity(), dto.useDice()));
        return ResponseEntity.ok(webMapper.toItemDto(item));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ItemDto> update(@PathVariable String itemId, @RequestBody ItemDto dto,
                                          @AuthenticationPrincipal String userId) {
        Item item = atualizarItem.execute(itemId, userId,
                new ItemInput(dto.name(), dto.description(), dto.targetAttribute(), dto.effectValue(),
                        dto.quantity(), dto.useDice()));
        return ResponseEntity.ok(webMapper.toItemDto(item));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(@PathVariable String itemId, @AuthenticationPrincipal String userId) {
        removerItem.execute(itemId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/toggle")
    public ResponseEntity<CharacterSheetDto> toggleEquip(@PathVariable String itemId,
                                                         @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(webMapper.toSheet(alternarEquipamento.execute(itemId, userId)));
    }
}
