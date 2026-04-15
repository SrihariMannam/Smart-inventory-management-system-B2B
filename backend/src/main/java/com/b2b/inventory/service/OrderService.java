package com.b2b.inventory.service;

import com.b2b.inventory.dto.OrderDto;
import com.b2b.inventory.dto.OrderItemDto;
import com.b2b.inventory.entity.Order;
import com.b2b.inventory.entity.OrderItem;
import com.b2b.inventory.entity.OrderStatus;
import com.b2b.inventory.entity.Product;
import com.b2b.inventory.entity.User;
import com.b2b.inventory.repository.OrderRepository;
import com.b2b.inventory.repository.ProductRepository;
import com.b2b.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Order placeOrder(OrderDto orderDto) {
        User user = userRepository.findById(orderDto.getUserId()).orElseThrow();
        Order order = Order.builder()
                .placedBy(user)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();
                
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDto itemDto : orderDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId()).orElseThrow();
            
            // For B2B order placement, this usually means increasing stock (or purchasing).
            // Usually, "Business places bulk order" means they are buying from supplier.
            // Or if they are selling, they are deducting stock. 
            // Assuming this is "Business placing order to supplier", stock goes up when delivered.
            
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getBasePrice()) // Simplification
                    .build();
            order.getItems().add(item);
            totalAmount = totalAmount.add(product.getBasePrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }
        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        
        // If order is DELIVERED, we increase stock
        if (status == OrderStatus.DELIVERED) {
            for(OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockLevel(product.getStockLevel() + item.getQuantity());
                productRepository.save(product);
            }
        }
        return orderRepository.save(order);
    }
}
