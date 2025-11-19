package com.tiago.erp.dto.product;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * DTO de entrada para crear/editar productos.
 * Mantiene nombres genéricos para maximizar compatibilidad con tu entidad Product.
 */
public class ProductRequest {

    @NotBlank(message = "name is required")
    @Size(max = 120, message = "name: max 120 chars")
    private String name;

    @NotBlank(message = "sku is required")
    @Size(max = 64, message = "sku: max 64 chars")
    private String sku;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "price must be >= 0")
    private BigDecimal price;

    @NotNull(message = "stock is required")
    @PositiveOrZero(message = "stock must be >= 0")
    private Integer stock;

    @NotNull(message = "active is required")
    private Boolean active;


    // 🔥 NUEVOS CAMPOS (compatibles con Product)
    
    @Size(max = 100, message = "category: max 100 chars")
    private String category;

    @Size(max = 10000, message = "description: max 10000 chars")
    private String description;

    @Size(max = 100, message = "barcode: max 100 chars")
    private String barcode;

    private String imageUrl;

    @DecimalMin(value = "0.0", inclusive = true, message = "costPrice must be >= 0")
    private BigDecimal costPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "profitMargin must be >= 0")
    private BigDecimal profitMargin;

    @DecimalMin(value = "0.0", inclusive = true, message = "salePrice must be >= 0")
    private BigDecimal salePrice;

    @PositiveOrZero(message = "stockMin must be >= 0")
    private Integer stockMin;


    public ProductRequest() {}


    // Getters y setters originales + nuevos

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }


    // 🔥 nuevos getters/setters

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }

    public BigDecimal getProfitMargin() { return profitMargin; }
    public void setProfitMargin(BigDecimal profitMargin) { this.profitMargin = profitMargin; }

    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }

    public Integer getStockMin() { return stockMin; }
    public void setStockMin(Integer stockMin) { this.stockMin = stockMin; }
}
