package com.tiago.erp.repository;

import com.tiago.erp.model.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    // ====== Derivadas tipadas (sin parámetros nulos) ======

    // Solo nombre de cliente
    Page<Sale> findByCustomer_NameContainingIgnoreCase(String customerName, Pageable pageable);

    // Solo rango de fechas [start, end)
    Page<Sale> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Rango de fechas + nombre
    Page<Sale> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndCustomer_NameContainingIgnoreCase(
            LocalDateTime start, LocalDateTime end, String customerName, Pageable pageable
    );

    // Solo start
    Page<Sale> findByCreatedAtGreaterThanEqual(LocalDateTime start, Pageable pageable);

    // Solo end (exclusivo)
    Page<Sale> findByCreatedAtLessThan(LocalDateTime end, Pageable pageable);

    // Contador para el Dashboard (lo usás en DashboardService)
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // ====== Compatibilidad: método search(...) usado por SalesExportServiceTest ======
    // Implementado como default para delegar a las derivadas (sin JPQL y sin nulos)
    default Page<Sale> search(LocalDateTime start,
                              LocalDateTime end,
                              String customerName,
                              Pageable pageable) {

        boolean hasName  = (customerName != null && !customerName.isBlank());
        boolean hasStart = (start != null);
        boolean hasEnd   = (end   != null);

        if (hasStart && hasEnd && hasName) {
            return findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndCustomer_NameContainingIgnoreCase(
                    start, end, customerName, pageable);
        }
        if (hasStart && hasEnd) {
            return findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end, pageable);
        }
        if (hasStart) {
            return findByCreatedAtGreaterThanEqual(start, pageable);
        }
        if (hasEnd) {
            return findByCreatedAtLessThan(end, pageable);
        }
        if (hasName) {
            return findByCustomer_NameContainingIgnoreCase(customerName, pageable);
        }
        return findAll(pageable);
    }
}
