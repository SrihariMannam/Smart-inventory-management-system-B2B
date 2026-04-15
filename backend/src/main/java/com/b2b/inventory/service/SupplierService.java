package com.b2b.inventory.service;

import com.b2b.inventory.entity.ProductSupplier;
import com.b2b.inventory.entity.Supplier;
import com.b2b.inventory.repository.ProductSupplierRepository;
import com.b2b.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductSupplierRepository productSupplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id).orElseThrow();
    }

    public Supplier addSupplier(Supplier supplier) {
        Supplier saved = supplierRepository.save(supplier);
        syncToCsv();
        return saved;
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
        syncToCsv();
    }

    // Auto-select best supplier logic
    public ProductSupplier getBestSupplierForProduct(Long productId) {
        return productSupplierRepository.findFirstByProductIdOrderByPriceOfferedAsc(productId)
                .orElseThrow(() -> new RuntimeException("No suppliers found for product"));
    }

    private void syncToCsv() {
        List<Supplier> suppliers = supplierRepository.findAll();
        File file = new File("../suppliers.csv");
        try (FileWriter writer = new FileWriter(file, false)) {
            writer.write("Supplier Name,Contact Email,Phone,Rating\n");
            for (Supplier s : suppliers) {
                String name    = s.getName()    != null ? s.getName().replace(",", " ")         : "Unknown";
                String email   = s.getContactEmail() != null ? s.getContactEmail().replace(",", " ") : "";
                String phone   = s.getPhone()   != null ? s.getPhone().replace(",", " ")        : "";
                String rating  = s.getRating()  != null ? s.getRating().toString()               : "0.0";
                writer.write(name + "," + email + "," + phone + "," + rating + "\n");
            }
        } catch (IOException e) {
            System.err.println("Failed to sync suppliers.csv: " + e.getMessage());
        }
    }
}
