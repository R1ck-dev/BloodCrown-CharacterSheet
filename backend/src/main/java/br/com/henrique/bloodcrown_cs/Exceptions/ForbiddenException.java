package br.com.henrique.bloodcrown_cs.Exceptions;

/**
 * Exceção de domínio: usuário autenticado, mas sem permissão para a operação.
 * Mapeada pelo GlobalExceptionHandler para HTTP 403.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
