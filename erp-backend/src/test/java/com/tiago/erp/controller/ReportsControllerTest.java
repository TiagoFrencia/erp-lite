package com.tiago.erp.controller;

import com.tiago.erp.service.SalesExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ReportsControllerTest {

    private MockMvc mvc;
    private SalesExportService exportService;

    @BeforeEach
    void setUp() {
        exportService = mock(SalesExportService.class);
        ReportsController controller = new ReportsController(exportService);
        mvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setMessageConverters(new ByteArrayHttpMessageConverter())
                .build();
    }

    @Test
    @DisplayName("CSV: retorna headers y body pasados por el service")
    void export_csv_headers_ok() throws Exception {
        byte[] csv = "id,total\n1,1000\n".getBytes(StandardCharsets.UTF_8);

        ResponseEntity<byte[]> mocked =
                ResponseEntity.ok()
                        .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"sales_20250101-20251231_juan-pérez.csv\"")
                        .body(csv);

        when(exportService.exportCsv(
                ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any())
        ).thenReturn(mocked);

        mvc.perform(get("/api/reports/sales/export")
                        .param("format", "csv")
                        .param("from", "2025-01-01")
                        .param("to", "2025-12-31")
                        .param("customer", "Juan Pérez"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("attachment;")))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("sales_20250101-20251231_juan-pérez.csv")))
                .andExpect(content().bytes(csv));
    }

    @Test
    @DisplayName("PDF: retorna headers y body pasados por el service")
    void export_pdf_headers_ok() throws Exception {
        byte[] pdf = new byte[]{1,2,3};

        ResponseEntity<byte[]> mocked =
                ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"sales_min-max_all.pdf\"")
                        .body(pdf);

        when(exportService.exportPdf(
                ArgumentMatchers.any(), ArgumentMatchers.any(), ArgumentMatchers.any())
        ).thenReturn(mocked);

        mvc.perform(get("/api/reports/sales/export")
                        .param("format", "pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("sales_min-max_all.pdf")))
                .andExpect(content().bytes(pdf));
    }
}
