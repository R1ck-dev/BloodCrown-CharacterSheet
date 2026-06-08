/**
 * Tipos da mesa tabletop — espelham os DTOs do backend (infrastructure/web/mesa/dto).
 * Manter sincronizado quando os DTOs Java mudarem.
 */

export interface Grid {
  tamanhoCelula: number;
  visivel: boolean;
  cor: string;
}

/** Cena: um mapa com seu grid, escala de medição e transformação. */
export interface Cena {
  id: string;
  nome: string | null;
  ordem: number;
  mapaUrl: string | null;
  grid: Grid;
  /** Quanto vale 1 célula em unidades de jogo (ex.: 1.5 = "1 célula = 1,5 m"). */
  escalaValor: number;
  escalaUnidade: string | null;
  mapaX: number;
  mapaY: number;
  /** 0 = tamanho natural da imagem. */
  mapaLargura: number;
  mapaAltura: number;
  /** Mapa travado como fundo (não arrastável/redimensionável). */
  mapaTravado: boolean;
}

/** Snapshot do status da ficha vinculada (barra de vida + selos), resolvido no backend. */
export interface FichaSnapshot {
  nome: string | null;
  currentHealth: number;
  maxHealth: number;
  defense: number;
  physicalRes: number;
  magicalRes: number;
}

export interface Token {
  id: string;
  nome: string | null;
  imagemUrl: string | null;
  cor: string | null;
  x: number;
  y: number;
  tamanho: number;
  donoUserId: string | null;
  /** Template/versão da biblioteca que este token representa (null = avulso). */
  templateId: string | null;
  /** Cena a que o token pertence (só aparece na cena ativa). */
  cenaId: string | null;
  /** Mostra o nome embaixo do token no tabuleiro. */
  nomeVisivel: boolean;
  /** Ficha (Character) vinculada a este token; null = sem ficha. */
  characterId: string | null;
  /** Mostra a barra/selos de status embaixo do token. */
  statusVisivel: boolean;
  /** Status da ficha vinculada (null se sem ficha ou status escondido). */
  ficha: FichaSnapshot | null;
}

/** Tipo de item da biblioteca: token (criatura/PJ), mapa (cena) ou documento (handout). */
export type TipoTemplate = 'TOKEN' | 'MAPA' | 'DOCUMENTO';

/** Item da biblioteca da mesa (sem posição): token, mapa ou documento. */
export interface TokenTemplate {
  id: string;
  nome: string | null;
  imagemUrl: string | null;
  /** Tipo do item; define a seção/filtro e o que acontece ao clicar. */
  tipo: TipoTemplate;
  /** Id do template base (este é uma versão dele); null = é base. Só vale pra TOKEN. */
  baseId: string | null;
  /** Id da pasta onde está organizado; null = raiz. */
  pastaId: string | null;
}

/** Pasta da biblioteca (organização dos templates, um nível). */
export interface BibliotecaPasta {
  id: string;
  nome: string | null;
}

export interface Mesa {
  id: string;
  nome: string;
  donoUserId: string;
  souDono: boolean;
  cenas: Cena[];
  cenaAtivaId: string | null;
  tokens: Token[];
  biblioteca: TokenTemplate[];
  pastas: BibliotecaPasta[];
  participantes: string[];
  codigoConvite: string;
}

export interface MesaResumo {
  id: string;
  nome: string;
  souDono: boolean;
  codigoConvite: string;
}

export interface NovaMesaInput {
  nome: string;
}

export interface EntrarMesaInput {
  codigo: string;
}

export interface NovoTokenInput {
  nome?: string | null;
  imagemUrl?: string | null;
  cor?: string | null;
  x: number;
  y: number;
  tamanho: number;
  templateId?: string | null;
  /** Cena a que o token será adicionado (em geral, a cena ativa). */
  cenaId: string;
}

/** Dados pra pré-carregar um item na biblioteca (opcionalmente como versão / em pasta). */
export interface NovoTemplateInput {
  nome: string;
  imagemUrl: string;
  tipo: TipoTemplate;
  baseId?: string | null;
  pastaId?: string | null;
}

export interface ConfigurarGridInput {
  tamanhoCelula: number;
  visivel: boolean;
  cor: string;
  escalaValor: number;
  escalaUnidade: string;
}

/** Posição/tamanho do mapa na cena + trava. largura/altura em 0 = tamanho natural. */
export interface TransformarMapaInput {
  x: number;
  y: number;
  largura: number;
  altura: number;
  travado: boolean;
}

/** Evento publicado em /topic/mesas/{id} (ver MesaEvento.java). */
export interface MesaEvento {
  tipo: 'mover' | 'atualizada' | 'regua' | 'ficha' | 'rolagem';
  tokenId: string | null;
  /** mover: posição; regua: ponto inicial. */
  x: number | null;
  y: number | null;
  /** regua: ponto final. */
  x2: number | null;
  y2: number | null;
  /** regua: cena em que se está medindo. */
  cenaId: string | null;
  /** regua: false limpa a régua dos outros clientes. */
  ativa: boolean | null;
  porUserId: string | null;
  /** ficha: novo snapshot de status do token (atualiza a barra ao vivo). */
  ficha?: FichaSnapshot | null;
  /** rolagem: fonte da rolagem (atributo/perícia/ataque). */
  rolagemSource?: string | null;
  /** rolagem: total da rolagem. */
  rolagemTotal?: number | null;
  /** rolagem: tipo da rolagem. */
  rolagemKind?: 'attribute' | 'damage' | null;
  /** rolagem: crítico/golpe pesado (dispara confetti). */
  rolagemCritico?: boolean | null;
  /** rolagem: nome do personagem que rolou (exibido no card). */
  rolagemNome?: string | null;
}
