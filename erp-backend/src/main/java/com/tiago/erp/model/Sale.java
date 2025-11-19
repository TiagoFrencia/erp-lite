package com.tiago.erp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "sales",
    indexes = {
        @Index(name = "idx_sales_created_at", columnList = "created_at")
    }
)
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_type", nullable = false, length = 10)
    private InvoiceType invoiceType = InvoiceType.B;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod = PaymentMethod.EFECTIVO;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SaleItem> items = new ArrayList<>();

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "total", nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /** Helper para mantener ambos lados de la relación */
    public void addItem(SaleItem item) {
        this.items.add(item);
        item.setSale(this);
    }

    // Getters & setters
    public Long getId() { return id; }
    public InvoiceType getInvoiceType() { return invoiceType; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public Customer getCustomer() { return customer; }
    public List<SaleItem> getItems() { return items; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getTotal() { return total; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setInvoiceType(InvoiceType invoiceType) { this.invoiceType = invoiceType; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public void setItems(List<SaleItem> items) { this.items = items; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
