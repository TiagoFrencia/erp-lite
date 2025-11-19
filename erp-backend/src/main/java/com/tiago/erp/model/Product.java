package com.tiago.erp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_name", columnList = "name"),
        @Index(name = "idx_products_sku", columnList = "sku"),
        @Index(name = "idx_products_category", columnList = "category")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_products_sku", columnNames = {"sku"})
    }
)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 60)
    private String sku;

    /** ✔ NUEVO: categoría del producto */
    @Column(length = 100)
    private String category;

    /** ✔ NUEVO: descripción larga del producto */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** ✔ NUEVO: código de barras */
    @Column(length = 100)
    private String barcode;

    /** ✔ NUEVO: URL de imagen */
    private String imageUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal costPrice;

    /** ✔ NUEVO: Porcentaje de ganancia */
    @Column(precision = 5, scale = 2)
    private BigDecimal profitMargin;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Min(0)
    @Column(nullable = false)
    private Integer stock;

    @Min(0)
    @Column(nullable = false)
    private Integer stockMin;

    /** Para optimistic locking en concurrencia de ventas. */
    @Version
    private Long version;

    public Product() {}

    public Product(
            String name,
            String sku,
            BigDecimal costPrice,
            BigDecimal salePrice,
            Integer stock,
            Integer stockMin
    ) {
        this.name = name;
        this.sku = sku;
        this.costPrice = costPrice;
        this.salePrice = salePrice;
        this.stock = stock;
        this.stockMin = stockMin;
    }

    /** Regla de negocio: descontar stock (lanza si no alcanza). */
    public void decreaseStock(int qty) {
        int remaining = this.stock - qty;
        if (remaining < 0) {
            throw new IllegalArgumentException("PRODUCT_STOCK_INSUFFICIENT");
        }
        this.stock = remaining;
    }

    // Getters & setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public BigDecimal getCostPrice() { return costPrice; }
    public BigDecimal getSalePrice() { return salePrice; }
    public Integer getStock() { return stock; }
    public Integer getStockMin() { return stockMin; }
    public Long getVersion() { return version; }

    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getBarcode() { return barcode; }
    public String getImageUrl() { return imageUrl; }
    public BigDecimal getProfitMargin() { return profitMargin; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSku(String sku) { this.sku = sku; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public void setStock(Integer stock) { this.stock = stock; }
    public void setStockMin(Integer stockMin) { this.stockMin = stockMin; }
    public void setVersion(Long version) { this.version = version; }

    public void setCategory(String category) { this.category = category; }
    public void setDescription(String description) { this.description = description; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setProfitMargin(BigDecimal profitMargin) { this.profitMargin = profitMargin; }
}
