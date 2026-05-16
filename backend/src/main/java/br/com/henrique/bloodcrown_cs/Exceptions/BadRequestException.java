package br.com.henrique.bloodcrown_cs.Exceptions;

/**
 * Exceção de domínio: violação de regra de negócio com dados validos sintaticamente
 * (ex: "Mana insuficiente", "Os usos já estão cheios").
 * Mapeada pelo GlobalExceptionHandler para HTTP 400.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
