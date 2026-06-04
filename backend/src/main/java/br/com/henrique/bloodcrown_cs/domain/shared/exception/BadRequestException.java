package br.com.henrique.bloodcrown_cs.domain.shared.exception;

/**
 * Exceção de domínio: violação de regra de negócio com dados válidos sintaticamente
 * (ex: "Mana insuficiente", "Os usos já estão cheios").
 * Mapeada pelo GlobalExceptionHandler para HTTP 400.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
