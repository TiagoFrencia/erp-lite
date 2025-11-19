package com.tiago.erp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiago.erp.dto.product.ProductRequest;
import com.tiago.erp.model.Product;
import com.tiago.erp.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.Validator;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.math.BigDecimal;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerValidationTest {

    private MockMvc mvc;
    private ProductService productService; // mock manual
    private final ObjectMapper om = new ObjectMapper();

    @BeforeEach
    void setUp() {
        productService = mock(ProductService.class);
        ProductController controller = new ProductController(productService);

        // Spring Validator (no Jakarta) para que @Valid funcione en standaloneSetup
        Validator springValidator = localSpringValidator();

        mvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(om))
                .setValidator(springValidator)
                .build();
    }

    private Validator localSpringValidator() {
        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
        bean.afterPropertiesSet(); // inicializa el bridge con Jakarta Validation
        return bean;
    }

    @Test
    @DisplayName("POST /api/products con campos faltantes -> 400")
    void create_invalid_400() throws Exception {
        ProductRequest bad = new ProductRequest(); // todo null

        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/products válido -> 200 y devuelve entidad")
    void create_ok_200() throws Exception {
        ProductRequest req = new ProductRequest();
        req.setName("Yerba 1Kg");
        req.setSku("YER-1KG");
        req.setPrice(new BigDecimal("3500"));
        req.setStock(10);
        req.setActive(true);

        Product saved = new Product();
        try { Product.class.getMethod("setId", Long.class).invoke(saved, 99L); } catch (Exception ignored) {}
        try { Product.class.getMethod("setName", String.class).invoke(saved, "Yerba 1Kg"); } catch (Exception ignored) {}

        when(productService.create(ArgumentMatchers.any(ProductRequest.class))).thenReturn(saved);

        mvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.name").value("Yerba 1Kg"));
    }
}
