package com.tiago.erp.repository;

import com.tiago.erp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Busca por nombre ignorando mayúsculas/minúsculas.
     */
    Optional<Customer> findByNameIgnoreCase(String name);
}
