package com.tiago.erp.service;

import com.tiago.erp.dto.CreateSaleItemRequest;
import com.tiago.erp.dto.CreateSaleRequest;
import com.tiago.erp.dto.SaleItemResponse;
import com.tiago.erp.dto.SaleResponse;
import com.tiago.erp.model.Customer;
import com.tiago.erp.model.Product;
import com.tiago.erp.model.Sale;
import com.tiago.erp.model.SaleItem;
import com.tiago.erp.model.InvoiceType;
import com.tiago.erp.model.PaymentMethod;
import com.tiago.erp.repository.ProductRepository;
import com.tiago.erp.repository.SaleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    // Cliente por defecto: Consumidor Final
    private static final Long CONSUMIDOR_FINAL_ID = 1L;

    @PersistenceContext
    private EntityManager em;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    // =====================================================
    // LISTADOS
    // =====================================================
    @Transactional(readOnly = true)
    public Page<SaleResponse> list(LocalDateTime start,
                                   LocalDateTime end,
                                   String customerName,
                                   Pageable pageable) {

        boolean hasName  = (customerName != null && !customerName.isBlank());
        boolean hasStart = (start != null);
        boolean hasEnd   = (end   != null);

        if (hasStart && hasEnd && hasName) {
            return saleRepository
                    .findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndCustomer_NameContainingIgnoreCase(
                            start, end, customerName, pageable)
                    .map(this::toResponse);
        }
        if (hasStart && hasEnd) {
            return saleRepository
                    .findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end, pageable)
                    .map(this::toResponse);
        }
        if (hasStart && !hasEnd) {
            return saleRepository.findByCreatedAtGreaterThanEqual(start, pageable)
                    .map(this::toResponse);
        }
        if (!hasStart && hasEnd) {
            return saleRepository.findByCreatedAtLessThan(end, pageable)
                    .map(this::toResponse);
        }
        if (hasName) {
            return saleRepository.findByCustomer_NameContainingIgnoreCase(customerName, pageable)
                    .map(this::toResponse);
        }

        return saleRepository.findAll(pageable).map(this::toResponse);
    }

    // =====================================================
    // CREAR VENTA
    // =====================================================
    @Transactional
    public SaleResponse createSale(@Valid CreateSaleRequest req) {

        // 1) Validar request
        if (req == null) {
            throw new IllegalArgumentException("El cuerpo de la venta no puede ser nulo");
        }

        // 2) Validar items
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("La venta debe tener al menos un ítem");
        }

        // 3) Definir tipo de comprobante (si no viene → Factura B)
        InvoiceType invoiceType = req.getInvoiceType() != null
                ? req.getInvoiceType()
                : InvoiceType.B;

        // 4) Resolver cliente
        Customer customer;

        if (invoiceType == InvoiceType.A) {
            // Para Factura A es obligatorio customerId
            if (req.getCustomerId() == null) {
                throw new IllegalArgumentException("Para Factura A debe seleccionar un cliente");
            }

            customer = em.find(Customer.class, req.getCustomerId());
            if (customer == null) {
                throw new IllegalArgumentException("Cliente no encontrado con id " + req.getCustomerId());
            }

        } else {
            // Factura B → buscar cliente por ID o nombre → si no viene nada → Consumidor Final
            if (req.getCustomerId() != null) {
                customer = em.find(Customer.class, req.getCustomerId());
                if (customer == null) {
                    throw new IllegalArgumentException("Cliente no encontrado con id " + req.getCustomerId());
                }
            }
            else if (req.getCustomerName() != null && !req.getCustomerName().isBlank()) {
                customer = findOrCreateCustomerByName(req.getCustomerName());
            }
            else {
                // Consumidor Final
                customer = em.find(Customer.class, CONSUMIDOR_FINAL_ID);
                if (customer == null) {
                    throw new IllegalStateException("No se encontró el cliente Consumidor Final (id=" + CONSUMIDOR_FINAL_ID + ")");
                }
            }
        }

        // 5) Resolver medio de pago (si no viene → EFECTIVO)
        PaymentMethod paymentMethod = req.getPaymentMethod() != null
                ? req.getPaymentMethod()
                : PaymentMethod.EFECTIVO;

        // 6) Crear la venta
        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setInvoiceType(invoiceType);
        sale.setPaymentMethod(paymentMethod);
        sale.setCreatedAt(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;

        // 7) Procesar ítems con sus validaciones
        for (CreateSaleItemRequest it : req.getItems()) {

            if (it.getQuantity() == null || it.getQuantity() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            }

            Product p = productRepository.findById(it.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + it.getProductId()));

            if (p.getStock() < it.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para " + p.getName());
            }

            // Actualizar stock
            p.setStock(p.getStock() - it.getQuantity());

            // Calcular precios
            BigDecimal unitPrice = p.getSalePrice() != null ? p.getSalePrice() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(it.getQuantity()));

            // Acumular subtotal de la venta
            subtotal = subtotal.add(lineSubtotal);

            // Crear item
            SaleItem si = new SaleItem();
            si.setSale(sale);
            si.setProduct(p);
            si.setQuantity(it.getQuantity());
            si.setUnitPrice(unitPrice);
            si.setSubtotal(lineSubtotal);

            sale.getItems().add(si);
        }

        // 8) Setear totales en la venta (por ahora total = subtotal)
        sale.setSubtotal(subtotal);
        sale.setTotal(subtotal);

        // 9) Guardar
        Sale saved = saleRepository.save(sale);

        // 10) Respuesta final
        return toResponse(saved);
    }

    // =====================================================
    // HELPERS
    // =====================================================

    Customer findOrCreateCustomerByName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio");
        }

        List<Customer> found = em
                .createQuery(
                        "SELECT c FROM Customer c WHERE LOWER(c.name) = LOWER(:n)",
                        Customer.class
                )
                .setParameter("n", name)
                .setMaxResults(1)
                .getResultList();

        if (!found.isEmpty()) return found.get(0);

        Customer c = new Customer();
        c.setName(name);
        em.persist(c);
        return c;
    }

    private SaleResponse toResponse(Sale sale) {

        List<SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(si -> {
                    BigDecimal unit = si.getUnitPrice() != null ? si.getUnitPrice() : BigDecimal.ZERO;
                    BigDecimal lineSubtotal = si.getSubtotal() != null
                            ? si.getSubtotal()
                            : unit.multiply(BigDecimal.valueOf(si.getQuantity()));

                    SaleItemResponse r = new SaleItemResponse();
                    r.setProductId(si.getProduct().getId());
                    r.setProductName(si.getProduct().getName());
                    r.setQuantity(si.getQuantity());
                    r.setUnitPrice(unit.doubleValue());
                    r.setSubtotal(lineSubtotal.doubleValue());
                    return r;
                })
                .toList();

        BigDecimal subtotal = sale.getSubtotal();
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) == 0) {
            subtotal = itemResponses.stream()
                    .map(SaleItemResponse::getSubtotal)
                    .map(BigDecimal::valueOf)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal total = sale.getTotal();
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) {
            total = subtotal;
        }

        SaleResponse out = new SaleResponse();
        out.setSaleId(sale.getId());
        out.setCustomerId(
                sale.getCustomer() != null ? sale.getCustomer().getId() : null
        );
        out.setCustomerName(
                sale.getCustomer() != null ? sale.getCustomer().getName() : null
        );
        out.setInvoiceType(
                sale.getInvoiceType() != null ? sale.getInvoiceType().name() : null
        );
        out.setCreatedAt(sale.getCreatedAt());
        out.setSubtotal(subtotal.doubleValue());
        out.setTotal(total.doubleValue());
        out.setPaymentMethod(
                sale.getPaymentMethod() != null
                        ? sale.getPaymentMethod().name()
                        : null
        );
        out.setItems(itemResponses);
        return out;
    }
}
