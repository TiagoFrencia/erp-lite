package com.tiago.erp.service;

import com.tiago.erp.repository.SaleItemRepository;
import com.tiago.erp.repository.SaleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;

    public DashboardService(SaleRepository saleRepository, SaleItemRepository saleItemRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
    }

    public DashboardSummary summary() {
        // Mes actual [primer día 00:00, primer día del mes siguiente 00:00)
        LocalDate firstDay = LocalDate.now().withDayOfMonth(1);
        LocalDateTime mStart = firstDay.atStartOfDay();
        LocalDateTime mEnd = firstDay.plusMonths(1).atStartOfDay();

        long monthSalesCount = saleRepository.countByCreatedAtBetween(mStart, mEnd);
        BigDecimal monthSalesTotal = nz(saleItemRepository.totalBetween(mStart, mEnd));

        // Últimos 7 días [hoy-7d 00:00, mañana 00:00)
        LocalDateTime dEnd = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime dStart = dEnd.minusDays(7);
        long last7DaysCount = saleRepository.countByCreatedAtBetween(dStart, dEnd);

        return new DashboardSummary(monthSalesCount, monthSalesTotal, last7DaysCount);
    }

    private BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    public record DashboardSummary(long monthSalesCount, BigDecimal monthSalesTotal, long last7DaysCount) {}
}
