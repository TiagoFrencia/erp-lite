package com.tiago.erp.config;

import com.tiago.erp.model.Customer;
import com.tiago.erp.model.Product;
import com.tiago.erp.model.Sale;
import com.tiago.erp.model.SaleItem;
import com.tiago.erp.repository.CustomerRepository;
import com.tiago.erp.repository.ProductRepository;
import com.tiago.erp.repository.SaleRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Carga datos de ejemplo en perfil 'dev' de forma idempotente.
 * - No duplica si ya existen productos/clientes/ventas.
 * - Congela unitPrice al crear la venta de ejemplo.
 */
@Component
@Profile("dev")
@Order(1)
public class DevDataLoader {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public DevDataLoader(ProductRepository productRepository,
                         CustomerRepository customerRepository,
                         SaleRepository saleRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
    }

    @Transactional
    public void init() {
        seedProducts();
        seedCustomers();
        seedSampleSale();
    }

    private void seedProducts() {
        // No duplicar si ya hay productos
        if (productRepository.count() > 0) return;

        Product yerba = new Product();
        yerba.setName("Yerba 1Kg");
        yerba.setSku("YRB-1KG");
        yerba.setCostPrice(new BigDecimal("2200.00"));
        yerba.setSalePrice(new BigDecimal("3500.00"));
        yerba.setStock(80);

        Product aceite = new Product();
        aceite.setName("Aceite 900ml");
        aceite.setSku("ACE-900");
        aceite.setCostPrice(new BigDecimal("1500.00"));
        aceite.setSalePrice(new BigDecimal("2300.00"));
        aceite.setStock(120);

        Product arroz = new Product();
        arroz.setName("Arroz Largo Fino 1Kg");
        arroz.setSku("ARZ-LF1");
        arroz.setCostPrice(new BigDecimal("900.00"));
        arroz.setSalePrice(new BigDecimal("1400.00"));
        arroz.setStock(200);

        productRepository.saveAll(List.of(yerba, aceite, arroz));
    }

    private void seedCustomers() {
        // Clientes mínimos; no duplicar por nombre (case-insensitive)
        createIfNotExists("Juan");
        createIfNotExists("María");
        createIfNotExists("Carlos");
    }

    private void createIfNotExists(String name) {
        customerRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Customer c = new Customer();
            c.setName(name);
            return customerRepository.save(c);
        });
    }

    private void seedSampleSale() {
        if (saleRepository.count() > 0) return;

        // Buscar entidades ya seed-eadas
        Customer juan = customerRepository.findByNameIgnoreCase("Juan")
                .orElseThrow(() -> new IllegalStateException("Seed error: falta cliente Juan"));

        Product yerba = productRepository.findByNameContainingIgnoreCase("Yerba").stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed error: falta producto Yerba"));

        Product aceite = productRepository.findByNameContainingIgnoreCase("Aceite").stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed error: falta producto Aceite"));

        // Crear venta
        Sale sale = new Sale();
        sale.setCustomer(juan);
        sale.setCreatedAt(LocalDateTime.now());

        SaleItem i1 = new SaleItem();
        i1.setSale(sale);
        i1.setProduct(yerba);
        i1.setQuantity(2);
        i1.setUnitPrice(yerba.getSalePrice()); // congelar precio

        SaleItem i2 = new SaleItem();
        i2.setSale(sale);
        i2.setProduct(aceite);
        i2.setQuantity(1);
        i2.setUnitPrice(aceite.getSalePrice());

        sale.setItems(List.of(i1, i2));

        // Persistir
        saleRepository.save(sale);

        // Ajustar stock a mano (si querés simular el comportamiento del service)
        yerba.setStock(yerba.getStock() - 2);
        aceite.setStock(aceite.getStock() - 1);
        productRepository.saveAll(List.of(yerba, aceite));
    }
}
