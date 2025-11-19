package com.tiago.erp.controller;

import com.tiago.erp.dto.LoginRequest;
import com.tiago.erp.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.username(), req.password()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).body("No autenticado");
        }

        return ResponseEntity.ok(
            java.util.Map.of(
                "username", user.getUsername(),
                "role", user.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("USER")
            )
        );
    }
}
