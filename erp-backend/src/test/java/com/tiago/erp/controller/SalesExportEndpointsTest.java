package com.tiago.erp.controller;

import com.tiago.erp.service.SaleService;
import com.tiago.erp.service.SalesExportService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SalesExportEndpointsTest {

    private final SaleService saleService = Mockito.mock(SaleService.class);
    private final SalesExportService exportService = Mockito.mock(SalesExportService.class);
    private final SaleController controller = new SaleController(saleService, exportService);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

    @Test
    void exportCsv_devuelveAttachmentConNombre() throws Exception {
        when(exportService.exportCsv(any(), any(), any()))
                .thenReturn(ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ventas_inicio_a_hoy.csv\"")
                        .body("saleId,createdAt,customer,total,itemsCount\n".getBytes()));

        mvc.perform(get("/api/sales/export.csv")
                        .param("customer", "juan"))
           .andExpect(status().isOk())
           .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8"))
           .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ventas_inicio_a_hoy.csv\""));
    }

    @Test
    void exportPdf_devuelveAttachmentConNombre() throws Exception {
        when(exportService.exportPdf(any(), any(), any()))
                .thenReturn(ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ventas_2025-10-01_a_2025-10-31.pdf\"")
                        .body(new byte[]{1, 2, 3}));

        mvc.perform(get("/api/sales/export.pdf")
                        .param("startDate", "2025-10-01")
                        .param("endDate", "2025-10-31"))
           .andExpect(status().isOk())
           .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
           .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ventas_2025-10-01_a_2025-10-31.pdf\""));
    }
}
