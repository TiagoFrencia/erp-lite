package com.tiago.erp.config;

import com.tiago.erp.model.*;
import com.tiago.erp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Order(100) // Ensure this runs after other initializers if any
public class AppDemoDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final PasswordEncoder passwordEncoder;

    public AppDemoDataInitializer(UserRepository userRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            SaleRepository saleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("🚀 Iniciando Data Seeding para ERP Lite...");

        initAdminUser();
        initProducts();
        initCustomers();
        initSales();

        System.out.println("✅ Data Seeding completado exitosamente.");
    }

    private void initAdminUser() {
        String username = "admin";
        String rawPassword = "admin123";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        userRepository.findByUsername(username).ifPresentOrElse(
                user -> {
                    System.out.println("🔄 Usuario 'admin' encontrado. Actualizando credenciales y estado...");
                    user.setPasswordHash(encodedPassword);
                    user.setActive(true);
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                },
                () -> {
                    System.out.println("✨ Creando usuario 'admin'...");
                    User admin = new User(username, encodedPassword, Role.ADMIN);
                    userRepository.save(admin);
                });
    }

    private void initProducts() {
        if (productRepository.count() > 0) {
            System.out.println("⏩ Productos ya existentes. Saltando creación.");
            return;
        }

        System.out.println("📦 Creando catálogo de productos demo...");
        List<Product> products = new ArrayList<>();

        // 1. Laptop (Tecnología, High Ticket)
        Product p1 = new Product();
        p1.setName("Laptop Pro 15");
        p1.setSku("TEC-LAP-001");
        p1.setCategory("Computación");
        p1.setDescription("Laptop de alto rendimiento para profesionales. 16GB RAM, 512GB SSD.");
        p1.setCostPrice(new BigDecimal("900.00"));
        p1.setSalePrice(new BigDecimal("1200.00"));
        p1.setStock(15);
        p1.setStockMin(5);
        p1.setProfitMargin(new BigDecimal("33.33"));
        p1.setImageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80");
        products.add(p1);

        // 2. Monitor (Stock Bajo)
        Product p2 = new Product();
        p2.setName("Monitor 4K 27\"");
        p2.setSku("TEC-MON-002");
        p2.setCategory("Periféricos");
        p2.setDescription("Monitor UHD 4K con panel IPS y soporte HDR.");
        p2.setCostPrice(new BigDecimal("250.00"));
        p2.setSalePrice(new BigDecimal("350.00"));
        p2.setStock(4); // Stock bajo para alertas
        p2.setStockMin(5);
        p2.setProfitMargin(new BigDecimal("40.00"));
        p2.setImageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80");
        products.add(p2);

        // 3. Teclado (Stock Normal)
        Product p3 = new Product();
        p3.setName("Teclado Mecánico RGB");
        p3.setSku("TEC-KEY-003");
        p3.setCategory("Periféricos");
        p3.setDescription("Teclado mecánico con switches azules y retroiluminación RGB.");
        p3.setCostPrice(new BigDecimal("40.00"));
        p3.setSalePrice(new BigDecimal("80.00"));
        p3.setStock(50);
        p3.setStockMin(10);
        p3.setProfitMargin(new BigDecimal("100.00"));
        p3.setImageUrl("https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=500&q=80");
        products.add(p3);

        // 4. Mouse (Sin Stock)
        Product p4 = new Product();
        p4.setName("Mouse Inalámbrico Ergo");
        p4.setSku("TEC-MOU-004");
        p4.setCategory("Periféricos");
        p4.setDescription("Mouse ergonómico vertical para reducir fatiga de muñeca.");
        p4.setCostPrice(new BigDecimal("20.00"));
        p4.setSalePrice(new BigDecimal("45.00"));
        p4.setStock(0); // Sin stock
        p4.setStockMin(10);
        p4.setProfitMargin(new BigDecimal("125.00"));
        p4.setImageUrl("https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80");
        products.add(p4);

        // 5. Auriculares
        Product p5 = new Product();
        p5.setName("Auriculares Bluetooth Noise-Cancel");
        p5.setSku("AUD-HEA-005");
        p5.setCategory("Audio");
        p5.setDescription("Auriculares con cancelación de ruido activa y 30hs de batería.");
        p5.setCostPrice(new BigDecimal("80.00"));
        p5.setSalePrice(new BigDecimal("150.00"));
        p5.setStock(25);
        p5.setStockMin(5);
        p5.setProfitMargin(new BigDecimal("87.50"));
        p5.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80");
        products.add(p5);

        productRepository.saveAll(products);
    }

    private void initCustomers() {
        if (customerRepository.count() > 0) {
            System.out.println("⏩ Clientes ya existentes. Saltando creación.");
            return;
        }

        System.out.println("👥 Creando clientes ficticios...");
        List<Customer> customers = new ArrayList<>();

        Customer c1 = new Customer();
        c1.setName("Empresa Alpha SA");
        c1.setEmail("contacto@alpha.com");
        c1.setPhone("+54 11 1234-5678");
        c1.setAddress("Av. Corrientes 1234, CABA");
        c1.setActive(true);
        customers.add(c1);

        Customer c2 = new Customer();
        c2.setName("Tech Solutions SRL");
        c2.setEmail("compras@techsolutions.com");
        c2.setPhone("+54 11 8765-4321");
        c2.setAddress("Calle Falsa 123, Córdoba");
        c2.setActive(true);
        customers.add(c2);

        Customer c3 = new Customer();
        c3.setName("Consumidor Final");
        c3.setEmail("consumidor@gmail.com");
        c3.setPhone("S/D");
        c3.setAddress("S/D");
        c3.setActive(true);
        customers.add(c3);

        customerRepository.saveAll(customers);
    }

    private void initSales() {
        if (saleRepository.count() > 0) {
            System.out.println("⏩ Ventas ya existentes. Saltando creación.");
            return;
        }

        List<Product> products = productRepository.findAll();
        List<Customer> customers = customerRepository.findAll();

        if (products.isEmpty() || customers.isEmpty()) {
            System.err.println("⚠️ No se pueden generar ventas: faltan productos o clientes.");
            return;
        }

        System.out.println("📈 Generando historial de ventas (últimos 30 días)...");
        Random random = new Random();
        int salesToCreate = 15;

        for (int i = 0; i < salesToCreate; i++) {
            Sale sale = new Sale();

            // Asignar cliente aleatorio
            Customer customer = customers.get(random.nextInt(customers.size()));
            sale.setCustomer(customer);

            // Configurar datos básicos de venta
            sale.setInvoiceType(InvoiceType.B);
            sale.setPaymentMethod(PaymentMethod.values()[random.nextInt(PaymentMethod.values().length)]);

            // IMPORTANTE: Distribuir fechas en el pasado (últimos 30 días)
            int daysAgo = random.nextInt(30);
            // Para que no sean todas a la misma hora, aleatorizamos la hora también
            LocalDateTime saleDate = LocalDateTime.now()
                    .minusDays(daysAgo)
                    .minusHours(random.nextInt(12))
                    .minusMinutes(random.nextInt(60));
            sale.setCreatedAt(saleDate);

            // Agregar items (1 a 3 productos por venta)
            int itemsCount = random.nextInt(3) + 1;
            BigDecimal totalSale = BigDecimal.ZERO;

            for (int j = 0; j < itemsCount; j++) {
                Product product = products.get(random.nextInt(products.size()));

                // Evitar productos sin stock si queremos ser estrictos,
                // pero para data seeding forzamos la venta o elegimos otro.
                // Como es demo, usaremos productos con stock > 0 preferentemente.
                if (product.getStock() <= 0)
                    continue;

                int quantity = random.nextInt(3) + 1; // 1 a 3 unidades
                BigDecimal unitPrice = product.getSalePrice();
                BigDecimal subtotalItem = unitPrice.multiply(BigDecimal.valueOf(quantity));

                SaleItem item = new SaleItem();
                item.setProduct(product);
                item.setQuantity(quantity);
                item.setUnitPrice(unitPrice);
                item.setSubtotal(subtotalItem);

                sale.addItem(item);
                totalSale = totalSale.add(subtotalItem);
            }

            // Si por azar no agregamos items (ej. solo seleccionó productos sin stock),
            // saltamos esta venta para no guardar una venta vacía.
            if (sale.getItems().isEmpty())
                continue;

            sale.setSubtotal(totalSale);
            sale.setTotal(totalSale); // Asumimos sin impuestos extra por ahora

            saleRepository.save(sale);
        }
        System.out.println("✅ Se generaron " + salesToCreate + " ventas de prueba.");
    }
}
