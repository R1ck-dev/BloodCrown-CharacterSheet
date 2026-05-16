package br.com.henrique.bloodcrown_cs.Exceptions;

/**
 * Exceção de domínio: recurso não encontrado (ou pertencente a outro usuário).
 * Mantida com a mesma mensagem em ambos os casos para evitar enumeração de IDs.
 * Mapeada pelo GlobalExceptionHandler para HTTP 404.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
