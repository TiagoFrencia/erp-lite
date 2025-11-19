package com.tiago.erp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(
    name = "customers",
    indexes = {
        @Index(name = "idx_customers_name", columnList = "name")
    }
)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String name;

    @Column
    private Boolean active;

    @Email
    @Column(length = 160)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 255)
    private String address;

    public Customer() {}

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public Boolean getActive() { return active; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setActive(Boolean active) { this.active = active; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
}
