package com.tiago.erp.controller;

import com.tiago.erp.dto.CreateSaleRequest;
import com.tiago.erp.dto.SaleResponse;
import com.tiago.erp.service.SaleService;
import com.tiago.erp.service.SalesExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin
public class SaleController {

    private final SaleService saleService;
    private final SalesExportService exportService;

    public SaleController(SaleService saleService, SalesExportService exportService) {
        this.saleService = saleService;
        this.exportService = exportService;
    }

    @Operation(summary = "Listar ventas paginadas con filtros opcionales")
    @GetMapping
    public Page<SaleResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, name = "customer") String customerName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("INVALID_DATE_RANGE");
        }
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime end   = (endDate   != null) ? endDate.plusDays(1).atStartOfDay() : null;
        return saleService.list(start, end, customerName, pageable);
    }

    @Operation(summary = "Crear una venta")
    @PostMapping
    public SaleResponse create(@Valid @RequestBody CreateSaleRequest body) {
        return saleService.createSale(body);
    }

    @Operation(summary = "Exportar ventas a CSV")
    @ApiResponse(responseCode = "200", description = "Archivo CSV")
    @GetMapping(value = "/export.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false, name = "customer") String customerName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return exportService.exportCsv(startDate, endDate, customerName);
    }

    @Operation(summary = "Exportar ventas a PDF")
    @ApiResponse(responseCode = "200", description = "Archivo PDF")
    @GetMapping(value = "/export.pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false, name = "customer") String customerName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return exportService.exportPdf(startDate, endDate, customerName);
    }
}
