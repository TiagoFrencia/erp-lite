package com.tiago.erp.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
        "jwt.secret=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "jwt.expiration=300000" // 5 minutos
})
class JwtUtilTest {

    @Autowired
    JwtUtil jwtUtil;

    @Test
    void generate_and_parse_token() {

        // 🔥 Genera token con el método correcto
        String token = jwtUtil.generateToken("tiago", "ADMIN");

        // 🔍 Validar username
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("tiago");

        // 🔍 Validar roles
        List<String> roles = jwtUtil.extractRoles(token);

        assertThat(roles).contains("ROLE_ADMIN");
    }
}
