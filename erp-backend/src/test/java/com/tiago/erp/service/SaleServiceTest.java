package com.tiago.erp.service;

import com.tiago.erp.dto.CreateSaleItemRequest;
import com.tiago.erp.dto.CreateSaleRequest;
import com.tiago.erp.dto.SaleResponse;
import com.tiago.erp.model.Customer;
import com.tiago.erp.model.Product;
import com.tiago.erp.repository.ProductRepository;
import com.tiago.erp.repository.SaleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test unitario de SaleService alineado con la implementación actual:
 * - SaleService usa EntityManager para buscar/crear Customer
 * - Descuenta stock y congela unitPrice
 */
class SaleServiceTest {

    @Test
    @SuppressWarnings("unchecked") // por el mock genérico de TypedQuery<Customer>
    void create_descuentaStock_y_calculaTotal_ok() {
        // Repos
        var productRepo = mock(ProductRepository.class);
        var saleRepo    = mock(SaleRepository.class);

        // EntityManager + TypedQuery (para findOrCreateCustomerByName)
        EntityManager em = mock(EntityManager.class);
        TypedQuery<Customer> query = (TypedQuery<Customer>) mock(TypedQuery.class);

        when(em.createQuery(anyString(), eq(Customer.class))).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.setMaxResults(anyInt())).thenReturn(query);
        // No existe el cliente -> lista vacía
        when(query.getResultList()).thenReturn(Collections.emptyList());
        // persist es void
        doNothing().when(em).persist(any());

        // Producto existente
        Product p = new Product();
        p.setId(1L);
        p.setName("Yerba 1Kg");
        p.setSku("YER-1KG");
        p.setSalePrice(new BigDecimal("3500.00"));
        p.setCostPrice(new BigDecimal("2000.00"));
        p.setStock(10);
        p.setStockMin(1);

        when(productRepo.findById(1L)).thenReturn(Optional.of(p));
        when(productRepo.save(any(Product.class))).thenAnswer(a -> a.getArgument(0));
        when(saleRepo.save(any())).thenAnswer(a -> a.getArgument(0));

        // Service bajo prueba
        var svc = new SaleService(saleRepo, productRepo);

        // Inyectamos el EntityManager privado via reflexión
        try {
            var field = SaleService.class.getDeclaredField("em");
            field.setAccessible(true);
            field.set(svc, em);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // Request: 2 unidades de $3500 = total $7000
        var item = new CreateSaleItemRequest(1L, 2);
        var req  = new CreateSaleRequest("Juan", List.of(item));

        SaleResponse resp = svc.createSale(req);


        assertThat(resp.getTotal()).isEqualTo(7000.0);
        assertThat(p.getStock()).isEqualTo(8); // 10 - 2
        verify(productRepo, times(1)).save(any(Product.class));
        verify(saleRepo, times(1)).save(any());
    }
}
