package com.tiago.erp.dto.customer;

import jakarta.validation.constraints.*;

/**
 * DTO de entrada para crear/editar clientes.
 * Sólo name y active son obligatorios. El resto es opcional.
 */
public class CustomerRequest {

    @NotBlank(message = "name is required")
    @Size(max = 120, message = "name: max 120 chars")
    private String name;

    @Email(message = "email must be valid")
    @Size(max = 160, message = "email: max 160 chars")
    private String email;

    @Size(max = 40, message = "phone: max 40 chars")
    private String phone;

    @Size(max = 255, message = "address: max 255 chars")
    private String address;

    @NotNull(message = "active is required")
    private Boolean active;

    public CustomerRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
