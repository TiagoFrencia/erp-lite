package com.tiago.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Logout "stateless": no invalida tokens en servidor (JWT), pero permite al frontend
 * tener un endpoint explícito para cerrar sesión (limpiar storage/cookies).
 * Mantiene compatibilidad total con el esquema actual.
 */
@RestController
@RequestMapping("/api/auth")
public class LogoutController {

    @PostMapping("/logout")
    public ResponseEntity<Message> logout() {
        // No se guarda estado de tokens (stateless JWT). El cliente debe descartar el token.
        return ResponseEntity.ok(new Message("logout_ok"));
    }

    public record Message(String status) {}
}
