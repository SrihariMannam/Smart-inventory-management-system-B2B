package com.b2b.inventory.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderDto {
    private Long userId;
    private List<OrderItemDto> items;
}
