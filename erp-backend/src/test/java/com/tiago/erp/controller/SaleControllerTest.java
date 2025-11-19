package com.tiago.erp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiago.erp.dto.CreateSaleItemRequest;
import com.tiago.erp.dto.CreateSaleRequest;
import com.tiago.erp.dto.SaleItemResponse;
import com.tiago.erp.dto.SaleResponse;
import com.tiago.erp.model.PaymentMethod;
import com.tiago.erp.service.SaleService;
import com.tiago.erp.service.SalesExportService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SaleControllerTest {

    private final SaleService saleService = Mockito.mock(SaleService.class);
    private final SalesExportService exportService = Mockito.mock(SalesExportService.class);

    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new SaleController(saleService, exportService))
            .build();

    private final ObjectMapper om = new ObjectMapper();

    @Test
    void createSale_ReturnsCreated() throws Exception {

        // Crear respuesta simulada
        var itemResp = new SaleItemResponse(
                1L,
                "Yerba 1Kg",
                2,
                3500.0,
                7000.0
        );

        var resp = new SaleResponse(
                1L,
                "Juan",
                LocalDateTime.now(),
                7000.0,      // subtotal
                7000.0,      // total
                PaymentMethod.EFECTIVO.name(),  // medio de pago agregado en paso 5
                List.of(itemResp)
        );

        when(saleService.createSale(any(CreateSaleRequest.class))).thenReturn(resp);

        // Request válido
        var req = new CreateSaleRequest(
                "Juan",
                List.of(new CreateSaleItemRequest(1L, 2))
        );

        mvc.perform(post("/api/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }
}
