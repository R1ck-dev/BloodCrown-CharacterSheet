package br.com.henrique.bloodcrown_cs.application.character.event;

/**
 * Evento de aplicação publicado quando o status (vida/defesa/resistências) de uma ficha muda.
 * Um listener AFTER_COMMIT na infraestrutura reage avisando as mesas onde o personagem tem token,
 * para as barras atualizarem ao vivo. Desacopla os use cases de Character do agregado Mesa.
 */
public record FichaStatusAlteradaEvent(String characterId) {
}
