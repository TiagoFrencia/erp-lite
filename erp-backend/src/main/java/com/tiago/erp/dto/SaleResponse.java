package com.tiago.erp.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO que representa una venta con sus items.
 */
public class SaleResponse {

    private Long saleId;
    private Long customerId;
    private String customerName;
    private String invoiceType;
    private LocalDateTime createdAt;
    private Double subtotal;
    private Double total;
    private String paymentMethod;
    private List<SaleItemResponse> items;

    public SaleResponse() {}

    public SaleResponse(Long saleId,
                        String customerName,
                        LocalDateTime createdAt,
                        Double subtotal,
                        Double total,
                        String paymentMethod,
                        List<SaleItemResponse> items) {
        this.saleId = saleId;
        this.customerName = customerName;
        this.createdAt = createdAt;
        this.subtotal = subtotal;
        this.total = total;
        this.paymentMethod = paymentMethod;
        this.items = items;
    }

    public Long getSaleId() { return saleId; }
    public void setSaleId(Long saleId) { this.saleId = saleId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getInvoiceType() { return invoiceType; }
    public void setInvoiceType(String invoiceType) { this.invoiceType = invoiceType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<SaleItemResponse> getItems() { return items; }
    public void setItems(List<SaleItemResponse> items) { this.items = items; }
}
