package com.b2b.inventory.controller;

import com.b2b.inventory.repository.OrderRepository;
import com.b2b.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        long totalRevenue = orderRepository.findAll().stream()
                .map(order -> order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add).longValue();
                
        long lowStockCount = productRepository.findAll().stream()
                .filter(p -> p.getStockLevel() != null && p.getReorderThreshold() != null)
                .filter(p -> p.getStockLevel() <= p.getReorderThreshold())
                .count();

        summary.put("totalProducts", totalProducts);
        summary.put("totalOrders", totalOrders);
        summary.put("totalRevenue", totalRevenue);
        summary.put("lowStockAlerts", lowStockCount);
        
        return ResponseEntity.ok(summary);
    }
}
