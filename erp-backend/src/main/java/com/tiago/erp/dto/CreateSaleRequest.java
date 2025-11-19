package com.tiago.erp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

import com.tiago.erp.model.InvoiceType;
import com.tiago.erp.model.PaymentMethod;

/**
 * Request DTO to create a Sale.
 * Bean Validation es aplicada; el controller debe anotar @Valid en el @RequestBody.
 */
public class CreateSaleRequest {

    @NotBlank(message = "customerName es obligatorio")
    @Size(max = 100, message = "customerName no debe superar 100 caracteres")
    private String customerName;

    @NotEmpty(message = "items no puede estar vacío")
    @Valid
    private List<CreateSaleItemRequest> items;

    /**
     * Tipo de comprobante de la venta.
     * Si viene null, el backend asume un valor por defecto (por ejemplo, B).
     */
    private InvoiceType invoiceType;

    /**
     * Cliente asociado a la venta.
     * Si es Factura A, debe venir un cliente válido.
     * Si es Factura B y no viene, el backend puede asumir Consumidor Final.
     */
    private Long customerId;

    /**
     * Medio de pago de la venta.
     * Si viene null, el backend puede asumir EFECTIVO como valor por defecto.
     */
    private PaymentMethod paymentMethod;

    public CreateSaleRequest() {}

    public CreateSaleRequest(String customerName, List<CreateSaleItemRequest> items) {
        this.customerName = customerName;
        this.items = items;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public List<CreateSaleItemRequest> getItems() { return items; }
    public void setItems(List<CreateSaleItemRequest> items) { this.items = items; }

    public InvoiceType getInvoiceType() { return invoiceType; }
    public void setInvoiceType(InvoiceType invoiceType) { this.invoiceType = invoiceType; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}
