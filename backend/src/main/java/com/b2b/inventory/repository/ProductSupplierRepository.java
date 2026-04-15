package com.b2b.inventory.repository;

import com.b2b.inventory.entity.ProductSupplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductSupplierRepository extends JpaRepository<ProductSupplier, Long> {
    List<ProductSupplier> findByProductId(Long productId);
    List<ProductSupplier> findBySupplierId(Long supplierId);
    Optional<ProductSupplier> findFirstByProductIdOrderByPriceOfferedAsc(Long productId);
}
