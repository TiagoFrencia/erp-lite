package com.tiago.erp.service;

import com.tiago.erp.model.User;
import com.tiago.erp.repository.UserRepository;
import com.tiago.erp.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder; // Import added
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(com.tiago.erp.dto.RegisterRequest req) {
        if (userRepository.findByUsername(req.username()).isPresent()) {
            throw new RuntimeException("El usuario ya existe");
        }

        var user = new User();
        user.setUsername(req.username());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        // El primer usuario podría ser ADMIN, o lógica simple: si username == 'admin',
        // es ADMIN
        if ("admin".equalsIgnoreCase(req.username())) {
            user.setRole(com.tiago.erp.model.Role.ADMIN);
        } else {
            user.setRole(com.tiago.erp.model.Role.USER);
        }

        user.setActive(true);
        userRepository.save(user);
    }

    public Map<String, String> login(String username, String password) {

        // 🔐 Autentica usuario
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        // 🔎 Busca el usuario en la BD
        User user = userRepository.findByUsername(username).orElseThrow();

        // 🔥 Genera tokens con roles correctos (CORREGIDO)
        String access = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        String refresh = jwtUtil.generateRefreshToken(user.getUsername(), user.getRole().name());

        return Map.of(
                "accessToken", access,
                "refreshToken", refresh,
                "tokenType", "Bearer");
    }

    public Map<String, String> refresh(String refreshToken) {

        // 🔍 Extrae username del refreshToken
        String username = jwtUtil.extractUsername(refreshToken);

        User user = userRepository.findByUsername(username).orElseThrow();

        // 🔥 Nuevamente, usa método corregido
        String access = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return Map.of(
                "accessToken", access,
                "tokenType", "Bearer");
    }
}
