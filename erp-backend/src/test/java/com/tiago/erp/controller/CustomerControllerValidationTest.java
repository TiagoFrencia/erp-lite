package com.tiago.erp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiago.erp.dto.customer.CustomerRequest;
import com.tiago.erp.model.Customer;
import com.tiago.erp.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.Validator;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerValidationTest {

    private MockMvc mvc;
    private CustomerService customerService; // mock manual
    private final ObjectMapper om = new ObjectMapper();

    @BeforeEach
    void setUp() {
        customerService = mock(CustomerService.class);
        CustomerController controller = new CustomerController(customerService);

        // Spring Validator (no Jakarta)
        Validator springValidator = localSpringValidator();

        mvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(om))
                .setValidator(springValidator)
                .build();
    }

    private Validator localSpringValidator() {
        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
        bean.afterPropertiesSet();
        return bean;
    }

    @Test
    @DisplayName("POST /api/customers con name faltante -> 400")
    void create_invalid_400() throws Exception {
        CustomerRequest bad = new CustomerRequest();
        bad.setActive(true); // falta name

        mvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/customers válido -> 200 y devuelve entidad")
    void create_ok_200() throws Exception {
        CustomerRequest req = new CustomerRequest();
        req.setName("Juan Pérez");
        req.setEmail("juan@example.com");
        req.setPhone("351555555");
        req.setActive(true);

        Customer saved = new Customer();
        try { Customer.class.getMethod("setId", Long.class).invoke(saved, 77L); } catch (Exception ignored) {}
        try { Customer.class.getMethod("setName", String.class).invoke(saved, "Juan Pérez"); } catch (Exception ignored) {}

        when(customerService.create(ArgumentMatchers.any(CustomerRequest.class))).thenReturn(saved);

        mvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(77))
                .andExpect(jsonPath("$.name").value("Juan Pérez"));
    }
}
