package com.tiago.erp.spec;

import com.tiago.erp.model.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class ProductSpecifications {

    private ProductSpecifications() {}

    /** Nombre contiene (case-insensitive) */
    public static Specification<Product> nameContainsIgnoreCase(String q) {
        if (isBlank(q)) return null;
        String pattern = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern);
    }

    /** SKU exacto */
    public static Specification<Product> skuEquals(String sku) {
        if (isBlank(sku)) return null;
        return (root, query, cb) -> cb.equal(root.get("sku"), sku.trim());
    }

    /** Stock mínimo */
    public static Specification<Product> stockMin(Integer min) {
        if (min == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("stock"), min);
    }

    /** Stock máximo */
    public static Specification<Product> stockMax(Integer max) {
        if (max == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("stock"), max);
    }

    /** Precio mínimo (salePrice) */
    public static Specification<Product> priceMin(BigDecimal min) {
        if (min == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("salePrice"), min);
    }

    /** Precio máximo (salePrice) */
    public static Specification<Product> priceMax(BigDecimal max) {
        if (max == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("salePrice"), max);
    }

    // ===============================================
    //   🔥 NUEVOS SPECIFICATIONS (NO ROMPEN NADA)
    // ===============================================

    /** Categoría exacta */
    public static Specification<Product> categoryEquals(String category) {
        if (isBlank(category)) return null;
        return (root, query, cb) -> cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase());
    }

    /** Categoría contiene (case-insensitive) */
    public static Specification<Product> categoryContainsIgnoreCase(String category) {
        if (isBlank(category)) return null;
        String pattern = "%" + category.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("category")), pattern);
    }

    /** Buscar por código de barras */
    public static Specification<Product> barcodeEquals(String barcode) {
        if (isBlank(barcode)) return null;
        return (root, query, cb) -> cb.equal(root.get("barcode"), barcode.trim());
    }

    /** Buscar por estado activo/inactivo */
    public static Specification<Product> activeIs(Boolean active) {
        if (active == null) return null;
        return (root, query, cb) -> cb.equal(root.get("active"), active);
    }

    // ----------
    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
