package com.tiago.erp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI erpLiteOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ERP-Lite API")
                        .description("API mínima para ERP-Lite (Productos, Clientes, Ventas).")
                        .version("v1")
                        .contact(new Contact()
                                .name("ERP-Lite")
                                .url("http://localhost:8080/swagger-ui.html")
                                .email("admin@example.com")
                        )
                );
    }
}
