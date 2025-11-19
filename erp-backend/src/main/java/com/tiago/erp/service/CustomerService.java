package com.tiago.erp.service;

import com.tiago.erp.dto.customer.CustomerRequest;
import com.tiago.erp.model.Customer;
import com.tiago.erp.repository.CustomerRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepository;

    @PersistenceContext
    private EntityManager em;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Page<Customer> list(Integer page, Integer size, String sort, String q, Boolean active) {
        Pageable pageable = buildPageable(page, size, sort);

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Customer> cq = cb.createQuery(Customer.class);
        Root<Customer> root = cq.from(Customer.class);

        List<Predicate> predicates = new ArrayList<>();

        // q -> nombre o email si existen
        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            List<Predicate> orParts = new ArrayList<>();
            try { orParts.add(cb.like(cb.lower(root.get("name")),  like)); } catch (IllegalArgumentException ignored) {}
            try { orParts.add(cb.like(cb.lower(root.get("email")), like)); } catch (IllegalArgumentException ignored) {}
            if (!orParts.isEmpty()) {
                predicates.add(cb.or(orParts.toArray(new Predicate[0])));
            }
        }

        // active si existe
        if (active != null) {
            try {
                predicates.add(cb.equal(root.get("active"), active));
            } catch (IllegalArgumentException ignored) {}
        }

        cq.where(predicates.toArray(new Predicate[0]));
        if (sort != null && !sort.isBlank()) {
            try {
                cq.orderBy(cb.asc(root.get(sort)));
            } catch (IllegalArgumentException ignored) {}
        }

        TypedQuery<Customer> query = em.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        List<Customer> content = query.getResultList();

        // count
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<Customer> countRoot = countCq.from(Customer.class);
        countCq.select(cb.count(countRoot));

        List<Predicate> countPred = new ArrayList<>();
        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase() + "%";
            List<Predicate> orParts = new ArrayList<>();
            try { orParts.add(cb.like(cb.lower(countRoot.get("name")),  like)); } catch (IllegalArgumentException ignored) {}
            try { orParts.add(cb.like(cb.lower(countRoot.get("email")), like)); } catch (IllegalArgumentException ignored) {}
            if (!orParts.isEmpty()) {
                countPred.add(cb.or(orParts.toArray(new Predicate[0])));
            }
        }
        if (active != null) {
            try { countPred.add(cb.equal(countRoot.get("active"), active)); } catch (IllegalArgumentException ignored) {}
        }
        countCq.where(countPred.toArray(new Predicate[0]));
        long total = em.createQuery(countCq).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    public Customer getById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("customer not found: " + id));
    }

    @Transactional
    public Customer create(CustomerRequest req) {
        Customer entity = new Customer();
        BeanUtils.copyProperties(req, entity);
        return customerRepository.save(entity);
    }

    @Transactional
    public Customer update(Long id, CustomerRequest req) {
        Customer entity = getById(id);
        BeanUtils.copyProperties(req, entity, "id", "createdAt", "createdDate");
        return customerRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        Customer entity = getById(id);
        try {
            entity.getClass().getMethod("setActive", Boolean.class).invoke(entity, Boolean.FALSE);
            customerRepository.save(entity);
        } catch (Exception noSoftDelete) {
            customerRepository.delete(entity);
        }
    }

    private Pageable buildPageable(Integer page, Integer size, String sort) {
        int p = (page == null || page < 0) ? 0 : page;
        int s = (size == null || size <= 0) ? 20 : size;
        if (sort == null || sort.isBlank()) return PageRequest.of(p, s);
        return PageRequest.of(p, s, Sort.by(Sort.Order.asc(sort)));
    }
}
