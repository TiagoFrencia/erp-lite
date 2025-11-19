package com.tiago.erp.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Wrapper uniforme de paginación para exponer en la API.
 * Evita filtrar campos internos de Spring Page en Swagger y mantiene
 * un contrato estable: content + metadatos simples.
 */
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private int totalPages;
    private long totalElements;
    private String sort;

    public PageResponse() {}

    public PageResponse(List<T> content, int page, int size, int totalPages, long totalElements, String sort) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.sort = sort;
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalPages(),
                page.getTotalElements(),
                formatSort(page.getSort())
        );
    }

    private static String formatSort(Sort sort) {
        if (sort == null || sort.isUnsorted()) return null;
        return sort.stream()
                .map(o -> o.getProperty() + "," + o.getDirection().name())
                .collect(Collectors.joining(";"));
    }

    // Getters & setters
    public List<T> getContent() { return content; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public int getTotalPages() { return totalPages; }
    public long getTotalElements() { return totalElements; }
    public String getSort() { return sort; }

    public void setContent(List<T> content) { this.content = content; }
    public void setPage(int page) { this.page = page; }
    public void setSize(int size) { this.size = size; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public void setSort(String sort) { this.sort = sort; }
}
