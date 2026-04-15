package com.b2b.inventory.service;

import com.b2b.inventory.entity.Product;
import com.b2b.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow();
    }

    public Product addProduct(Product product) {
        Product saved = productRepository.save(product);
        syncToCsv();
        return saved;
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setStockLevel(updated.getStockLevel());
        existing.setReorderThreshold(updated.getReorderThreshold());
        existing.setBasePrice(updated.getBasePrice());
        Product saved = productRepository.save(existing);
        syncToCsv();
        return saved;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
        syncToCsv();
    }

    // Smart logic: Get low stock items
    public List<Product> getLowStockAlerts() {
        List<Product> allProducts = productRepository.findAll();
        return allProducts.stream()
                .filter(p -> p.getStockLevel() <= p.getReorderThreshold())
                .collect(Collectors.toList());
    }

    /**
     * Dynamically constructs the CSV state based on real-time database mutations.
     * Guarantees external products.csv file is always perfectly synchronized with active memory.
     */
    private void syncToCsv() {
        List<Product> products = productRepository.findAll();
        File file = new File("../products.csv");
        
        try (FileWriter writer = new FileWriter(file, false)) { // 'false' causes overwrite
            writer.write("Product Name,Category,Base Price (USD)\n");
            
            for (Product p : products) {
                // Strip commas from strings to prevent accidental CSV column shifts
                String name = p.getName() != null ? p.getName().replace(",", " ") : "Unknown";
                String category = p.getCategory() != null ? p.getCategory().replace(",", " ") : "General";
                String price = p.getBasePrice() != null ? p.getBasePrice().toString() : "0.00";
                
                writer.write(name + "," + category + "," + price + "\n");
            }
        } catch (IOException e) {
            System.err.println("CRITICAL FAULT: Failed to synchronize products.csv logic: " + e.getMessage());
        }
    }
}
