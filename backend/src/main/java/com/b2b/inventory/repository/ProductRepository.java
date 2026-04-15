package com.b2b.inventory.repository;

import com.b2b.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByStockLevelLessThanEqual(Integer threshold);
}
