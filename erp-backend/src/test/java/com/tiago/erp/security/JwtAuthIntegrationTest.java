package com.tiago.erp.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests de integración end-to-end para Auth/JWT.
 * Usa perfil dev (seeds admin/admin123).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
class JwtAuthIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    @Test
    @DisplayName("Login OK devuelve accessToken y refreshToken")
    void login_ok_returns_tokens() {
        LoginRequest req = new LoginRequest("admin", "admin123");

        ResponseEntity<LoginResponse> resp = rest.postForEntity(
                baseUrl() + "/api/auth/login",
                req,
                LoginResponse.class
        );

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Evita warning de posible null con inferencia explícita:
        LoginResponse body = Objects.requireNonNull(resp.getBody(), "login body null");

        assertThat(body.accessToken).isNotBlank();
        assertThat(body.refreshToken).isNotBlank();
        assertThat(body.tokenType).isNotBlank();
    }

    @Test
    @DisplayName("/api/auth/me sin token debe responder 401/403")
    void me_without_token_unauthorized() {
        ResponseEntity<String> resp = rest.getForEntity(
                baseUrl() + "/api/auth/me",
                String.class
        );
        assertThat(resp.getStatusCode().value()).isIn(401, 403);
    }

    @Test
    @DisplayName("/api/auth/me con token válido responde 200 e incluye username")
    void me_with_token_ok() {
        // 1) Login
        LoginRequest req = new LoginRequest("admin", "admin123");
        ResponseEntity<LoginResponse> loginResp = rest.postForEntity(
                baseUrl() + "/api/auth/login",
                req,
                LoginResponse.class
        );
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        LoginResponse loginBody = Objects.requireNonNull(loginResp.getBody(), "login body null");
        String token = loginBody.accessToken;

        // 2) Llamar a /me con Authorization: Bearer
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> meResp = rest.exchange(
                baseUrl() + "/api/auth/me",
                HttpMethod.GET,
                entity,
                String.class
        );

        assertThat(meResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        String meBody = Objects.requireNonNull(meResp.getBody(), "me body null");
        assertThat(meBody).contains("admin");
    }

    @Test
    @DisplayName("Refresh devuelve un nuevo accessToken")
    void refresh_returns_new_access_token() {
        // 1) Login para obtener refresh
        LoginRequest req = new LoginRequest("admin", "admin123");
        ResponseEntity<LoginResponse> loginResp = rest.postForEntity(
                baseUrl() + "/api/auth/login",
                req,
                LoginResponse.class
        );
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        LoginResponse loginBody = Objects.requireNonNull(loginResp.getBody(), "login body null");
        String refresh = loginBody.refreshToken;

        // 2) Refresh
        RefreshRequest refreshReq = new RefreshRequest(refresh);
        ResponseEntity<LoginResponse> refreshResp = rest.postForEntity(
                baseUrl() + "/api/auth/refresh",
                refreshReq,
                LoginResponse.class
        );

        assertThat(refreshResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        LoginResponse refreshBody = Objects.requireNonNull(refreshResp.getBody(), "refresh body null");
        assertThat(refreshBody.accessToken).isNotBlank();
        // No exigimos que sea distinto; depende de tu implementación.
    }

    // --- DTOs locales para requests/responses de auth ---
    static class LoginRequest {
        public String username;
        public String password;

        public LoginRequest() {}
        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }
    }

    static class RefreshRequest {
        public String refreshToken;

        public RefreshRequest() {}
        public RefreshRequest(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class LoginResponse {
        @JsonProperty("accessToken")
        public String accessToken;
        @JsonProperty("refreshToken")
        public String refreshToken;
        @JsonProperty("tokenType")
        public String tokenType;
    }
}
