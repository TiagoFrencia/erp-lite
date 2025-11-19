package com.tiago.erp.config;

import com.tiago.erp.dto.CreateSaleItemRequest;
import com.tiago.erp.dto.CreateSaleRequest;
import com.tiago.erp.model.Customer;
import com.tiago.erp.model.Product;
import com.tiago.erp.repository.CustomerRepository;
import com.tiago.erp.repository.ProductRepository;
import com.tiago.erp.service.SaleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeder para entorno dev:
 * - Crea productos y clientes si no existen.
 * - Intenta crear una venta demo SOLO si existe createSale(CreateSaleRequest) en SaleService.
 *   (si no existe la firma exacta, no rompe el arranque)
 */
@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleService saleService;

    public DataSeeder(ProductRepository productRepository,
                      CustomerRepository customerRepository,
                      SaleService saleService) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.saleService = saleService;
    }

    @Override
    public void run(String... args) {
        seedProducts();
        seedCustomers();
        tryCreateDemoSaleIfSupported();
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        // Tu Product expone: setSku, setName, setCostPrice, setSalePrice, setStock, setStockMin
        Product p1 = new Product();
        p1.setSku("SKU-001");
        p1.setName("Café molido 500g");
        p1.setSalePrice(new BigDecimal("4500.00"));
        p1.setCostPrice(new BigDecimal("3600.00")); // opcional, para evitar null
        p1.setStock(50);
        p1.setStockMin(0);

        Product p2 = new Product();
        p2.setSku("SKU-002");
        p2.setName("Azúcar 1kg");
        p2.setSalePrice(new BigDecimal("2500.00"));
        p2.setCostPrice(new BigDecimal("2000.00"));
        p2.setStock(100);
        p2.setStockMin(0);

        Product p3 = new Product();
        p3.setSku("SKU-003");
        p3.setName("Yerba 1kg");
        p3.setSalePrice(new BigDecimal("6000.00"));
        p3.setCostPrice(new BigDecimal("4800.00"));
        p3.setStock(80);
        p3.setStockMin(0);

        productRepository.saveAll(List.of(p1, p2, p3));
    }

    private void seedCustomers() {
        if (customerRepository.count() > 0) return;

        // Tu Customer solo tiene: id, name
        Customer c1 = new Customer();
        c1.setName("Cliente Demo");

        Customer c2 = new Customer();
        c2.setName("Juan Pérez");

        customerRepository.saveAll(List.of(c1, c2));
    }

    /**
     * Intenta crear una venta demo:
     * - Busca un método createSale(CreateSaleRequest) en SaleService
     * - Si no existe, no hace nada (no rompe)
     */
    private void tryCreateDemoSaleIfSupported() {
        try {
            Method m = SaleService.class.getMethod("createSale", CreateSaleRequest.class);

            var products = productRepository.findAll();
            if (products.isEmpty()) return;

            CreateSaleItemRequest i1 = new CreateSaleItemRequest();
            i1.setProductId(products.get(0).getId());
            i1.setQuantity(2);

            CreateSaleRequest req = new CreateSaleRequest();
            req.setCustomerName("Cliente Demo");
            req.setItems(new ArrayList<>(List.of(i1)));

            m.invoke(saleService, req);
        } catch (NoSuchMethodException e) {
            // La firma no existe en este proyecto: omitimos la venta demo sin fallar
        } catch (Exception ignored) {
            // Cualquier otra excepción al crear la venta demo no debe impedir el arranque
        }
    }
}
