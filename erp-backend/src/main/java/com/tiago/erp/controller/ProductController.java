package com.tiago.erp.controller;

import com.tiago.erp.api.PageResponse;
import com.tiago.erp.dto.product.ProductRequest;
import com.tiago.erp.model.Product;
import com.tiago.erp.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Catálogo de Productos.
 * Mantiene las mismas rutas y respuestas (entidad Product) para no romper el front.
 * POST/PUT ahora validan con DTO (@Valid ProductRequest).
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @Operation(
        summary = "Lista productos con filtros opcionales y paginación",
        description = """
            Parámetros opcionales:
            - page, size, sort
            - q: búsqueda por nombre/sku
            - minStock: stock mínimo
            - active: true/false
            """
    )
    @GetMapping
    public ResponseEntity<PageResponse<Product>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Boolean active
    ) {
        Page<Product> result = service.list(page, size, sort, q, minStock, active);
        return ResponseEntity.ok(PageResponse.from(result));
    }

    @Operation(summary = "Obtiene un producto por id")
    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Crea un producto")
    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody ProductRequest request) {
        Product saved = service.create(request);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Actualiza un producto")
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id,
                                          @Valid @RequestBody ProductRequest request) {
        Product saved = service.update(id, request);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Elimina (o soft-delete) un producto")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    //   ENDPOINT: /api/products/low-stock
    // ==========================================
    @Operation(summary = "Lista productos con stock por debajo de un umbral")
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStock(
            @RequestParam(name = "threshold", defaultValue = "5") Integer threshold
    ) {
        List<Product> result = service.findLowStock(threshold);
        return ResponseEntity.ok(result);
    }
}
