package com.tiago.erp.controller;

import com.tiago.erp.model.Product;
import com.tiago.erp.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test del ProductController usando MockMvc en modo standalone.
 * Ahora el controller depende de ProductService (no del Repository).
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController controller;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/products con filtros y paginación responde 200 y PageResponse OK")
    void list_conFiltrosYPaginacion_ok() throws Exception {
        // --- Datos de ejemplo (ajustar campos que existan en tu entidad Product) ---
        Product p = new Product();
        // Si tu entidad tiene setters distintos, ajustalos acá:
        // id
        try { Product.class.getMethod("setId", Long.class).invoke(p, 11L); } catch (Exception ignored) {}
        // name
        try { Product.class.getMethod("setName", String.class).invoke(p, "Yerba 1Kg"); } catch (Exception ignored) {}
        // sku
        try { Product.class.getMethod("setSku", String.class).invoke(p, "YER-1KG"); } catch (Exception ignored) {}
        // precios/stock (opcionales, si están):
        try { Product.class.getMethod("setSalePrice", BigDecimal.class).invoke(p, new BigDecimal("3500.00")); } catch (Exception ignored) {}
        try { Product.class.getMethod("setCostPrice", BigDecimal.class).invoke(p, new BigDecimal("2200.00")); } catch (Exception ignored) {}
        try { Product.class.getMethod("setStock", Integer.class).invoke(p, 5); } catch (Exception ignored) {}

        Page<Product> page = new PageImpl<>(
                List.of(p),
                PageRequest.of(0, 10, Sort.by("name").ascending()),
                1
        );

        // Mock del service: coincide con la firma (page, size, sort, q, minStock, active)
        when(productService.list(
                ArgumentMatchers.any(),  // page
                ArgumentMatchers.any(),  // size
                ArgumentMatchers.any(),  // sort
                ArgumentMatchers.any(),  // q
                ArgumentMatchers.any(),  // minStock
                ArgumentMatchers.any()   // active
        )).thenReturn(page);

        mvc.perform(get("/api/products")
                        .param("q", "yerba")
                        .param("minStock", "10")
                        .param("sort", "name")
                        .param("size", "10")
                        .param("page", "0"))
                .andExpect(status().isOk())
                // PageResponse: content[0].name presente
                .andExpect(jsonPath("$.content[0].name").value("Yerba 1Kg"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
