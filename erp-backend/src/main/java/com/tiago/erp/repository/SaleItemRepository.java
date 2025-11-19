package com.tiago.erp.repository;

import com.tiago.erp.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    @Query("""
        SELECT COALESCE(SUM(i.unitPrice * i.quantity), 0)
        FROM SaleItem i
        WHERE i.sale.createdAt >= :start AND i.sale.createdAt < :end
    """)
    BigDecimal totalBetween(LocalDateTime start, LocalDateTime end);
}
