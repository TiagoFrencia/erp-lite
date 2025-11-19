package com.tiago.erp.dto;

public record LoginRequest(
        String username,
        String password
) {}
