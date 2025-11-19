package com.tiago.erp.repository;

import com.tiago.erp.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Buscar producto exacto por nombre (case-insensitive)
    Optional<Product> findByNameIgnoreCase(String name);

    // Buscar productos que contengan parte del nombre (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Buscar producto por SKU (si lo usás en los seeds)
    Optional<Product> findBySku(String sku);

    // ==============================
    //   NUEVO MÉTODO: low stock
    // ==============================
    List<Product> findByStockLessThan(Integer stock);
}
