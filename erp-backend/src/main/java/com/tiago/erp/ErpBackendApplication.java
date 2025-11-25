package com.tiago.erp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ErpBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ErpBackendApplication.class, args);
    }

    /**
     * Genera y muestra por consola un hash BCrypt para la contraseña de admin.
     * SOLO se ejecuta en el perfil "dev", así que en Render (prod) no corre.
     */
    @Bean
    @Profile("dev")
    public CommandLineRunner printAdminHash(PasswordEncoder encoder) {
        return args -> {
            String raw = "admin123"; // 👉 contraseña que vas a usar para el usuario admin
            String hash = encoder.encode(raw);

            System.out.println("=========================================");
            System.out.println(" HASH NUEVO PARA USUARIO 'admin'");
            System.out.println(" CONTRASEÑA EN TEXTO PLANO: " + raw);
            System.out.println(" HASH BCRYPT GENERADO:");
            System.out.println(hash);
            System.out.println("=========================================");
        };
    }
}
