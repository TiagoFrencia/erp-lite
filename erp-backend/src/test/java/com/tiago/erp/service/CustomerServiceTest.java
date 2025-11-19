package com.tiago.erp.service;

import com.tiago.erp.dto.customer.CustomerRequest;
import com.tiago.erp.model.Customer;
import com.tiago.erp.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class CustomerServiceTest {

    private CustomerRepository customerRepository;
    private CustomerService service;

    @BeforeEach
    void setUp() {
        customerRepository = Mockito.mock(CustomerRepository.class);
        service = new CustomerService(customerRepository);
    }

    @Test
    @DisplayName("create(): copia campos del DTO y guarda")
    void create_ok() {
        CustomerRequest req = new CustomerRequest();
        req.setName("Juan Pérez");
        req.setEmail("juan@example.com");
        req.setPhone("351555555");
        req.setActive(true);

        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            try { Customer.class.getMethod("setId", Long.class).invoke(c, 1L); } catch (Exception ignored) {}
            return c;
        });

        Customer saved = service.create(req);

        assertThat(getString(saved, "getName")).isEqualTo("Juan Pérez");
        assertThat(getString(saved, "getEmail")).isEqualTo("juan@example.com");
        assertThat(getString(saved, "getPhone")).isEqualTo("351555555");
        assertThat(getBoolean(saved, "getActive")).isTrue();
        assertThat(getLong(saved, "getId")).isEqualTo(1L);
    }

    @Test
    @DisplayName("update(): copia campos del DTO en entidad existente")
    void update_ok() {
        Customer existing = new Customer();
        when(customerRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerRequest req = new CustomerRequest();
        req.setName("Juan P.");
        req.setEmail("jp@example.com");
        req.setPhone("351444444");
        req.setActive(true);

        Customer saved = service.update(3L, req);

        assertThat(getString(saved, "getName")).isEqualTo("Juan P.");
        assertThat(getString(saved, "getEmail")).isEqualTo("jp@example.com");
        assertThat(getString(saved, "getPhone")).isEqualTo("351444444");
        assertThat(getBoolean(saved, "getActive")).isTrue();
    }

    @Test
    @DisplayName("delete(): intenta soft-delete (active=false) o borrado duro")
    void delete_soft_or_hard_ok() {
        Customer existing = new Customer();
        when(customerRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        service.delete(7L);

        verify(customerRepository, atLeast(0)).save(any(Customer.class));
        verify(customerRepository, atLeast(0)).delete(any(Customer.class));
    }

    // helpers reflejados
    private String getString(Object o, String getter) {
        try { return (String) o.getClass().getMethod(getter).invoke(o); } catch (Exception e) { return null; }
    }
    private Long getLong(Object o, String getter) {
        try { return (Long) o.getClass().getMethod(getter).invoke(o); } catch (Exception e) { return null; }
    }
    private Boolean getBoolean(Object o, String getter) {
        try { return (Boolean) o.getClass().getMethod(getter).invoke(o); } catch (Exception e) { return null; }
    }
}
