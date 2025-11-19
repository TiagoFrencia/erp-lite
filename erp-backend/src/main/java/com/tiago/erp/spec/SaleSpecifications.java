package com.tiago.erp.spec;

import com.tiago.erp.model.Sale;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class SaleSpecifications {

    public static Specification<Sale> customerNameLike(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return cb.conjunction();
            var customer = root.join("customer", JoinType.LEFT);
            return cb.like(cb.lower(customer.get("name")), "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Sale> createdAtBetween(LocalDateTime start, LocalDateTime end) {
        return (root, query, cb) -> {
            if (start == null && end == null) return cb.conjunction();
            if (start != null && end != null) return cb.between(root.get("createdAt"), start, end);
            if (start != null) return cb.greaterThanOrEqualTo(root.get("createdAt"), start);
            return cb.lessThanOrEqualTo(root.get("createdAt"), end);
        };
    }
}
