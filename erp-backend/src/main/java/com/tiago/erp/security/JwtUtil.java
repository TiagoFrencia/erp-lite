package com.tiago.erp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // ================================
    // PROPIEDADES CORRECTAS DESDE application.yml
    // ================================
    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.access-ttl-minutes}")
    private long accessTtlMinutes;

    @Value("${security.jwt.refresh-ttl-minutes}")
    private long refreshTtlMinutes;

    // ================================
    // CLAVE DE FIRMA
    // ================================
    private Key getSignKey() {
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        } catch (Exception e) {
            throw new RuntimeException("JWT secret inválido. Debe estar en Base64.", e);
        }
    }

    // ================================
    // GENERACIÓN DE TOKENS
    // ================================
    public String generateAccessToken(String username, String role) {
        return buildToken(username, role, accessTtlMinutes);
    }

    public String generateRefreshToken(String username, String role) {
        return buildToken(username, role, refreshTtlMinutes);
    }

    public String generateToken(String username, String role) {
        return generateAccessToken(username, role);
    }

    private String buildToken(String username, String role, long minutes) {

        String normalizedRole = "ROLE_" + role.toUpperCase();

        return Jwts.builder()
                .setClaims(Map.of(
                        "role", role,                      // formato simple
                        "roles", List.of(normalizedRole)   // formato Spring Security
                ))
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + minutes * 60_000))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ================================
    // EXTRACCIÓN
    // ================================
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        Object r = claims.get("role");
        return r != null ? r.toString() : null;
    }

    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        Object raw = claims.get("roles");

        if (raw instanceof List<?> list)
            return list.stream().map(Object::toString).toList();

        if (raw instanceof String s)
            return List.of("ROLE_" + s.toUpperCase());

        return List.of();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ================================
    // VALIDACIÓN
    // ================================
    public boolean validateToken(String token, String username) {
        return extractUsername(token).equals(username)
                && !isTokenExpired(token);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
