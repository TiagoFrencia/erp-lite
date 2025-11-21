package com.tiago.erp.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==========================
    //  Ejemplos de handlers específicos
    //  (dejo estructura genérica; si tenías otros, mantenelos)
    // ==========================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
                                                     HttpServletRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );

        ApiError body = new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                "Datos inválidos",
                req.getRequestURI(),
                errors
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex,
                                                              HttpServletRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(cv ->
                errors.put(cv.getPropertyPath().toString(), cv.getMessage())
        );

        ApiError body = new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Constraint Violation",
                "Datos inválidos",
                req.getRequestURI(),
                errors
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex,
                                                       HttpServletRequest req) {

        ApiError body = new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Missing Parameter",
                ex.getMessage(),
                req.getRequestURI(),
                null
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                       HttpServletRequest req) {

        ApiError body = new ApiError(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Type Mismatch",
                ex.getMessage(),
                req.getRequestURI(),
                null
        );
    return ResponseEntity.badRequest().body(body);
    }

    // ==========================
    //  Catch-all (lo importante)
    // ==========================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {

        // 🔥 ESTA LÍNEA ES LA CLAVE:
        // Logueamos el error con stacktrace para verlo en Render
        log.error("Unhandled exception in {}: {}", req.getRequestURI(), ex.getMessage(), ex);

        ApiError body = new ApiError(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Ha ocurrido un error inesperado",
                req.getRequestURI(),
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
