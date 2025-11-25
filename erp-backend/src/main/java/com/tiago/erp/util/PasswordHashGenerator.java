package com.tiago.erp.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        // Acá elegís la contraseña en texto plano
        String rawPassword = "admin123";

        PasswordEncoder encoder = new BCryptPasswordEncoder();

        String hash = encoder.encode(rawPassword);

        System.out.println("=========================================");
        System.out.println(" Contraseña en texto plano: " + rawPassword);
        System.out.println(" Hash BCRYPT generado:");
        System.out.println(hash);
        System.out.println("=========================================");
        System.out.println(" Copiá ESTE hash para usarlo en la columna password_hash");
    }
}
