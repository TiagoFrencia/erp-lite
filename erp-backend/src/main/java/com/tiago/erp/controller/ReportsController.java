package com.tiago.erp.controller;

import com.tiago.erp.service.SalesExportService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Alias unificado para exportes de ventas.
 * NO rompe compatibilidad: sólo delega a SalesExportService,
 * que ya retorna ResponseEntity<byte[]> con headers correctos.
 */
@RestController
@RequestMapping("/api/reports/sales")
public class ReportsController {

    private final SalesExportService exportService;

    public ReportsController(SalesExportService exportService) {
        this.exportService = exportService;
    }

    @Operation(
        summary = "Exporta ventas (CSV o PDF)",
        description = "format=csv|pdf, filtros opcionales: from/to (YYYY-MM-DD), customer."
    )
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportSales(
            @RequestParam String format,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String customer
    ) {
        LocalDate fromDate = parseIso(from);
        LocalDate toDate   = parseIso(to);

        return switch (format.toLowerCase()) {
            case "csv" -> exportService.exportCsv(fromDate, toDate, customer);
            case "pdf" -> exportService.exportPdf(fromDate, toDate, customer);
            default    -> throw new IllegalArgumentException("format must be csv|pdf");
        };
    }

    private LocalDate parseIso(String s) {
        if (s == null || s.isBlank()) return null;
        return LocalDate.parse(s);
    }
}
