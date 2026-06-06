/**
 * Tipos da mesa tabletop — espelham os DTOs do backend (infrastructure/web/mesa/dto).
 * Manter sincronizado quando os DTOs Java mudarem.
 */

export interface Grid {
  tamanhoCelula: number;
  visivel: boolean;
  cor: string;
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
}

/** Molde de token na biblioteca da mesa (sem posição). */
export interface TokenTemplate {
  id: string;
  nome: string | null;
  imagemUrl: string | null;
}

export interface Mesa {
  id: string;
  nome: string;
  donoUserId: string;
  souDono: boolean;
  mapaUrl: string | null;
  grid: Grid;
  tokens: Token[];
  biblioteca: TokenTemplate[];
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
}

export interface ConfigurarGridInput {
  tamanhoCelula: number;
  visivel: boolean;
  cor: string;
}

/** Evento publicado em /topic/mesas/{id} (ver MesaEvento.java). */
export interface MesaEvento {
  tipo: 'mover' | 'atualizada';
  tokenId: string | null;
  x: number | null;
  y: number | null;
  porUserId: string | null;
}
