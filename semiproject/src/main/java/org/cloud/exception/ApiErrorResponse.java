package org.cloud.exception;

public record ApiErrorResponse(
        int status,
        String code,
        String message) {
}
