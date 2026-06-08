package br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.mapper;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.henrique.bloodcrown_cs.domain.character.model.FichaStatusSnapshot;
import br.com.henrique.bloodcrown_cs.domain.character.port.CharacterRepository;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.BibliotecaPasta;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Cena;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Grid;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Mesa;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TipoTemplate;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.Token;
import br.com.henrique.bloodcrown_cs.domain.mesa.model.TokenTemplate;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.CenaDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.FichaResumoDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.GridDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.MesaResumoResponse;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.PastaDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TokenDto;
import br.com.henrique.bloodcrown_cs.infrastructure.web.mesa.dto.TokenTemplateDto;

import lombok.RequiredArgsConstructor;

/** Mapeia o domínio Mesa para os DTOs web. souDono é calculado a partir do userId da requisição. */
@Component
@RequiredArgsConstructor
public class MesaWebMapper {

    private final CharacterRepository characterRepository;

    public MesaResponse toResponse(Mesa mesa, String userId) {
        Map<String, FichaStatusSnapshot> snapshots = carregarSnapshots(mesa);
        List<CenaDto> cenas = mesa.getCenas().stream().map(this::toCenaDto).toList();
        List<TokenDto> tokens = mesa.getTokens().stream().map(t -> toTokenDto(t, snapshots)).toList();
        List<TokenTemplateDto> biblioteca = mesa.getBiblioteca().stream().map(this::toTemplateDto).toList();
        List<PastaDto> pastas = mesa.getPastas().stream().map(this::toPastaDto).toList();
        return new MesaResponse(
                mesa.getId(),
                mesa.getNome(),
                mesa.getDonoUserId(),
                mesa.isDono(userId),
                cenas,
                mesa.getCenaAtivaId(),
                tokens,
                biblioteca,
                pastas,
                List.copyOf(mesa.getParticipantes()),
                mesa.getCodigoConvite());
    }

    public CenaDto toCenaDto(Cena c) {
        return new CenaDto(
                c.getId(),
                c.getNome(),
                c.getOrdem(),
                c.getMapaUrl(),
                toGridDto(c.getGrid()),
                c.getEscalaValor(),
                c.getEscalaUnidade(),
                c.getMapaX(),
                c.getMapaY(),
                c.getMapaLargura(),
                c.getMapaAltura(),
                c.isMapaTravado());
    }

    public TokenTemplateDto toTemplateDto(TokenTemplate t) {
        String tipo = (t.getTipo() != null ? t.getTipo() : TipoTemplate.TOKEN).name();
        return new TokenTemplateDto(t.getId(), t.getNome(), t.getImagemUrl(), tipo, t.getBaseId(), t.getPastaId());
    }

    public PastaDto toPastaDto(BibliotecaPasta p) {
        return new PastaDto(p.getId(), p.getNome());
    }

    public MesaResumoResponse toResumo(Mesa mesa, String userId) {
        return new MesaResumoResponse(mesa.getId(), mesa.getNome(), mesa.isDono(userId), mesa.getCodigoConvite());
    }

    public TokenDto toTokenDto(Token t, Map<String, FichaStatusSnapshot> snapshots) {
        FichaResumoDto ficha = null;
        // Só expõe o status quando visível — esconder = não vazar o snapshot nem pelo JSON.
        if (t.isStatusVisivel() && t.getCharacterId() != null) {
            ficha = toFichaResumo(snapshots.get(t.getCharacterId()));
        }
        return new TokenDto(t.getId(), t.getNome(), t.getImagemUrl(), t.getCor(),
                t.getX(), t.getY(), t.getTamanho(), t.getDonoUserId(), t.getTemplateId(),
                t.getCenaId(), t.isNomeVisivel(), t.getCharacterId(), t.isStatusVisivel(), ficha);
    }

    /** Converte o snapshot de status numa view de token (null-safe). */
    public FichaResumoDto toFichaResumo(FichaStatusSnapshot s) {
        if (s == null) {
            return null;
        }
        return new FichaResumoDto(s.nome(), s.currentHealth(), s.maxHealth(),
                s.defense(), s.physicalRes(), s.magicalRes());
    }

    /** Carrega, numa só query, os snapshots de status das fichas vinculadas aos tokens da mesa. */
    private Map<String, FichaStatusSnapshot> carregarSnapshots(Mesa mesa) {
        Set<String> ids = mesa.getTokens().stream()
                .map(Token::getCharacterId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return characterRepository.buscarSnapshotsPorIds(ids).stream()
                .collect(Collectors.toMap(FichaStatusSnapshot::characterId, Function.identity()));
    }

    private GridDto toGridDto(Grid g) {
        Grid grid = g != null ? g : new Grid();
        return new GridDto(grid.getTamanhoCelula(), grid.isVisivel(), grid.getCor());
    }
}
