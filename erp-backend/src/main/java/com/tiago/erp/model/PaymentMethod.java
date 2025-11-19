package com.tiago.erp.model;

/**
 * Medio de pago de una venta.
 * Se puede extender en el futuro (por ejemplo, Cuenta Corriente, MercadoPago, etc.).
 */
public enum PaymentMethod {
    EFECTIVO,
    DEBITO,
    CREDITO,
    TRANSFERENCIA
}
