package com.tiago.erp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Ítem que compone CreateSaleRequest.
 */
public class CreateSaleItemRequest {

    @NotNull(message = "productId es obligatorio")
    private Long productId;

    @NotNull(message = "quantity es obligatoria")
    @Min(value = 1, message = "quantity debe ser >= 1")
    private Integer quantity;

    public CreateSaleItemRequest() {}

    public CreateSaleItemRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
