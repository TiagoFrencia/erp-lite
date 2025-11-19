package com.tiago.erp.service;

import com.tiago.erp.dto.product.ProductRequest;
import com.tiago.erp.model.Product;
import com.tiago.erp.repository.ProductRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @PersistenceContext
    private EntityManager em;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> list(Integer page, Integer size, String sort,
                              String q, Integer minStock, Boolean active) {

        Pageable pageable = buildPageable(page, size, sort);

        // --- Query principal ---
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Product> cq = cb.createQuery(Product.class);
        Root<Product> root = cq.from(Product.class);

        List<Predicate> predicates = new ArrayList<>();

        // filtro q -> nombre o sku
        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            List<Predicate> orParts = new ArrayList<>();
            try {
                orParts.add(cb.like(cb.lower(root.get("name")), like));
            } catch (IllegalArgumentException ignored) {}
            try {
                orParts.add(cb.like(cb.lower(root.get("sku")), like));
            } catch (IllegalArgumentException ignored) {}
            if (!orParts.isEmpty()) {
                predicates.add(cb.or(orParts.toArray(new Predicate[0])));
            }
        }

        // minStock
        if (minStock != null) {
            try {
                predicates.add(cb.greaterThanOrEqualTo(root.get("stock"), minStock));
            } catch (IllegalArgumentException ignored) {}
        }

        // active
        if (active != null) {
            try {
                predicates.add(cb.equal(root.get("active"), active));
            } catch (IllegalArgumentException ignored) {}
        }

        cq.where(predicates.toArray(new Predicate[0]));

        // sort asc simple
        if (sort != null && !sort.isBlank()) {
            try {
                cq.orderBy(cb.asc(root.get(sort)));
            } catch (IllegalArgumentException ignored) {}
        }

        TypedQuery<Product> query = em.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        List<Product> content = query.getResultList();

        // --- Count ---
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<Product> countRoot = countCq.from(Product.class);
        countCq.select(cb.count(countRoot));

        List<Predicate> countPred = new ArrayList<>();

        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            List<Predicate> orParts = new ArrayList<>();
            try {
                orParts.add(cb.like(cb.lower(countRoot.get("name")), like));
            } catch (IllegalArgumentException ignored) {}
            try {
                orParts.add(cb.like(cb.lower(countRoot.get("sku")), like));
            } catch (IllegalArgumentException ignored) {}
            if (!orParts.isEmpty()) {
                countPred.add(cb.or(orParts.toArray(new Predicate[0])));
            }
        }

        if (minStock != null) {
            try {
                countPred.add(cb.greaterThanOrEqualTo(countRoot.get("stock"), minStock));
            } catch (IllegalArgumentException ignored) {}
        }

        if (active != null) {
            try {
                countPred.add(cb.equal(countRoot.get("active"), active));
            } catch (IllegalArgumentException ignored) {}
        }

        countCq.where(countPred.toArray(new Predicate[0]));
        long total = em.createQuery(countCq).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    // ==========================================
    //   ESTE MÉTODO QUEDA IGUAL
    // ==========================================
    public List<Product> findLowStock(Integer threshold) {
        if (threshold == null || threshold < 0) threshold = 0;
        return productRepository.findByStockLessThan(threshold);
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("product not found: " + id));
    }

    // ==========================================
    //   CREATE — con mapeo extra para nuevos campos
    // ==========================================
    @Transactional
    public Product create(ProductRequest req) {
        Product entity = new Product();

        // copia original de los campos que ya existían
        BeanUtils.copyProperties(req, entity);

        // mapeo manual para campos nuevos según tu Product.java actualizado
        entity.setCategory(req.getCategory());
        entity.setDescription(req.getDescription());
        entity.setBarcode(req.getBarcode());
        entity.setImageUrl(req.getImageUrl());
        entity.setCostPrice(req.getCostPrice());
        entity.setProfitMargin(req.getProfitMargin());
        entity.setSalePrice(req.getSalePrice());
        entity.setStockMin(req.getStockMin());

        return productRepository.save(entity);
    }

    // ==========================================
    //   UPDATE — sin romper nada
    // ==========================================
    @Transactional
    public Product update(Long id, ProductRequest req) {
        Product entity = getById(id);

        BeanUtils.copyProperties(req, entity, "id", "version");

        // mapeo manual de los nuevos campos
        entity.setCategory(req.getCategory());
        entity.setDescription(req.getDescription());
        entity.setBarcode(req.getBarcode());
        entity.setImageUrl(req.getImageUrl());
        entity.setCostPrice(req.getCostPrice());
        entity.setProfitMargin(req.getProfitMargin());
        entity.setSalePrice(req.getSalePrice());
        entity.setStockMin(req.getStockMin());

        return productRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        Product entity = getById(id);
        try {
            entity.getClass().getMethod("setActive", Boolean.class).invoke(entity, Boolean.FALSE);
            productRepository.save(entity);
        } catch (Exception noSoftDelete) {
            productRepository.delete(entity);
        }
    }

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int p = (page == null || page < 0) ? 0 : page;
        int s = (size == null || size <= 0) ? 20 : size;
        if (sort == null || sort.isBlank()) return PageRequest.of(p, s);
        return PageRequest.of(p, s, Sort.by(Sort.Order.asc(sort)));
    }
}
