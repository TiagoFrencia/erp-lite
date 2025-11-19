package com.tiago.erp.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tiago.erp.model.Sale;
import com.tiago.erp.repository.SaleRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SalesExportService {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_DATE;

    private final SaleRepository saleRepository;

    public SalesExportService(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    public ResponseEntity<byte[]> exportCsv(LocalDate start, LocalDate end, String customerName) {
        List<Sale> sales = querySales(start, end, customerName);
        StringBuilder sb = new StringBuilder();
        sb.append("id,fecha,cliente,items,total\n");
        for (Sale s : sales) {
            int items = s.getItems() != null ? s.getItems().size() : 0;
            BigDecimal total = s.getItems() == null ? BigDecimal.ZERO :
                    s.getItems().stream()
                            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
            sb.append(s.getId()).append(',')
              .append(s.getCreatedAt().toLocalDate()).append(',')
              .append(s.getCustomer().getName()).append(',')
              .append(items).append(',')
              .append(total).append('\n');
        }
        String filename = String.format("ventas_%s_%s.csv",
                start != null ? start.format(ISO_DATE) : "all",
                end != null ? end.format(ISO_DATE) : "all");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString().getBytes());
    }

    public ResponseEntity<byte[]> exportPdf(LocalDate start, LocalDate end, String customerName) {
        List<Sale> sales = querySales(start, end, customerName);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(doc, baos);
            doc.open();
            doc.add(new Paragraph("Ventas"));
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.addCell(new PdfPCell(new com.lowagie.text.Phrase("ID")));
            table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Fecha")));
            table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Cliente")));
            table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Items")));
            table.addCell(new PdfPCell(new com.lowagie.text.Phrase("Total")));

            for (Sale s : sales) {
                int items = s.getItems() != null ? s.getItems().size() : 0;
                BigDecimal total = s.getItems() == null ? BigDecimal.ZERO :
                        s.getItems().stream()
                                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                table.addCell(String.valueOf(s.getId()));
                table.addCell(s.getCreatedAt().toLocalDate().toString());
                table.addCell(s.getCustomer().getName());
                table.addCell(String.valueOf(items));
                table.addCell(total.toPlainString());
            }
            doc.add(table);
            doc.close();

            String filename = String.format("ventas_%s_%s.pdf",
                    start != null ? start.format(ISO_DATE) : "all",
                    end != null ? end.format(ISO_DATE) : "all");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(baos.toByteArray());
        } catch (DocumentException e) {
            throw new RuntimeException("Error generando PDF", e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private List<Sale> querySales(LocalDate start, LocalDate end, String customerName) {
        List<Sale> all = saleRepository.findAll();
        return all.stream()
                .filter(s -> start == null || !s.getCreatedAt().toLocalDate().isBefore(start))
                .filter(s -> end == null || !s.getCreatedAt().toLocalDate().isAfter(end))
                .filter(s -> customerName == null || s.getCustomer().getName().toLowerCase().contains(customerName.toLowerCase()))
                .toList();
    }
}
