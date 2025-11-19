package com.tiago.erp.service;

import com.tiago.erp.repository.SaleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;

class SalesExportServiceTest {

    @Test
    void exportCsv_devuelveBytesYHeaders() {
        var repo = Mockito.mock(SaleRepository.class);
        Mockito.when(repo.search(
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        nullable(String.class),
                        any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of())); // sin ventas

        var svc = new SalesExportService(repo);

        var resp = svc.exportCsv(LocalDate.now().minusDays(1), LocalDate.now(), null);

        String contentType = resp.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        assertThat(contentType).isNotNull();
        assertThat(contentType).contains("text/csv");

        String contentDisp = resp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        assertThat(contentDisp).isNotNull();
        assertThat(contentDisp).contains("attachment").contains("filename=");

        // Forzamos no-nulidad para el analizador estático
        byte[] body = Objects.requireNonNull(resp.getBody(), "CSV body no debería ser null");
        assertThat(body.length).isGreaterThan(0);
    }

    @Test
    void exportPdf_devuelveBytesYHeaders() {
        var repo = Mockito.mock(SaleRepository.class);
        Mockito.when(repo.search(
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        nullable(String.class),
                        any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        var svc = new SalesExportService(repo);

        var resp = svc.exportPdf(LocalDate.now().minusDays(1), LocalDate.now(), null);

        String contentType = resp.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        assertThat(contentType).isNotNull();
        assertThat(contentType).contains("application/pdf");

        String contentDisp = resp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        assertThat(contentDisp).isNotNull();
        assertThat(contentDisp).contains("attachment").contains("filename=");

        byte[] body = Objects.requireNonNull(resp.getBody(), "PDF body no debería ser null");
        assertThat(body.length).isGreaterThan(0);
    }
}
