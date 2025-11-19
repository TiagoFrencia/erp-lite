package com.tiago.erp.controller;

import com.tiago.erp.api.PageResponse;
import com.tiago.erp.dto.customer.CustomerRequest;
import com.tiago.erp.model.Customer;
import com.tiago.erp.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Maestros de Clientes.
 * Mantiene las mismas rutas y respuestas (entidad Customer).
 * POST/PUT ahora validan con DTO (@Valid CustomerRequest).
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @Operation(
        summary = "Lista clientes con filtros opcionales y paginación",
        description = """
            Parámetros opcionales:
            - page, size, sort
            - q: búsqueda por nombre/email (si el repositorio lo soporta)
            - active: true/false (si la entidad lo expone)
            """
    )
    @GetMapping
    public ResponseEntity<PageResponse<Customer>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active
    ) {
        Page<Customer> result = service.list(page, size, sort, q, active);
        return ResponseEntity.ok(PageResponse.from(result));
    }

    @Operation(summary = "Obtiene un cliente por id")
    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Crea un cliente")
    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest request) {
        Customer saved = service.create(request);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Actualiza un cliente")
    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id,
                                           @Valid @RequestBody CustomerRequest request) {
        Customer saved = service.update(id, request);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Elimina (o soft-delete) un cliente")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
