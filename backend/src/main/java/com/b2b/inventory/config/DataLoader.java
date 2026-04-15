package com.b2b.inventory.config;

import com.b2b.inventory.entity.Product;
import com.b2b.inventory.entity.Role;
import com.b2b.inventory.entity.Supplier;
import com.b2b.inventory.entity.User;
import com.b2b.inventory.repository.ProductRepository;
import com.b2b.inventory.repository.SupplierRepository;
import com.b2b.inventory.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(ProductRepository productRepository,
                      SupplierRepository supplierRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.productRepository  = productRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository     = userRepository;
        this.passwordEncoder    = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        // ── 1. AUTO-GENERATE PLATFORM USERS ──────────────────────────────
        if (userRepository.count() == 0) {
            System.out.println("====== AUTO-GENERATING PLATFORM IDENTITIES ======");
            userRepository.saveAll(List.of(
                User.builder().name("System Administrator").email("admin@company.com")
                    .password(passwordEncoder.encode("password")).role(Role.ADMIN).build(),
                User.builder().name("Acme Corp").email("acme@business.com")
                    .password(passwordEncoder.encode("password")).role(Role.BUSINESS).build(),
                User.builder().name("Global Tech Supplies").email("supplier@gmail.com")
                    .password(passwordEncoder.encode("password")).role(Role.SUPPLIER).build()
            ));
            System.out.println("====== 3 PLATFORM USERS CREATED ======");
        }

        // ── 2. AUTO-IMPORT PRODUCTS FROM CSV ─────────────────────────────
        if (productRepository.count() == 0) {
            importProducts();
        }

        // ── 3. AUTO-IMPORT SUPPLIERS FROM CSV ────────────────────────────
        if (supplierRepository.count() == 0) {
            importSuppliers();
        }
    }

    private void importProducts() {
        ClassPathResource resource = new ClassPathResource("products.csv");
        if (!resource.exists()) {
            System.out.println("products.csv not found in classpath resources");
            return;
        }
        System.out.println("====== IMPORTING PRODUCTS FROM CSV ======");
        try (InputStream is = resource.getInputStream();
             BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            String line;
            boolean first = true;
            List<Product> products = new ArrayList<>();
            while ((line = br.readLine()) != null) {
                if (first) { first = false; continue; }
                String[] v = line.split(",");
                if (v.length >= 3) {
                    Product p = new Product();
                    p.setName(v[0].trim());
                    p.setCategory(v[1].trim());
                    try { p.setBasePrice(new BigDecimal(v[2].trim())); } catch (Exception e) { p.setBasePrice(BigDecimal.ZERO); }
                    p.setStockLevel(50);
                    p.setReorderThreshold(15);
                    p.setDescription("Auto-imported from products.csv");
                    products.add(p);
                }
            }
            productRepository.saveAll(products);
            System.out.println("====== IMPORTED " + products.size() + " PRODUCTS ======");
        } catch (Exception e) {
            System.err.println("Error importing products.csv: " + e.getMessage());
        }
    }

    private void importSuppliers() {
        ClassPathResource resource = new ClassPathResource("suppliers.csv");
        if (!resource.exists()) {
            System.out.println("suppliers.csv not found in classpath resources");
            return;
        }
        System.out.println("====== IMPORTING SUPPLIERS FROM CSV ======");
        try (InputStream is = resource.getInputStream();
             BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            String line;
            boolean first = true;
            List<Supplier> suppliers = new ArrayList<>();
            while ((line = br.readLine()) != null) {
                if (first) { first = false; continue; }
                String[] v = line.split(",");
                if (v.length >= 4) {
                    Supplier s = new Supplier();
                    s.setName(v[0].trim());
                    s.setContactEmail(v[1].trim());
                    s.setPhone(v[2].trim());
                    try { s.setRating(Double.parseDouble(v[3].trim())); } catch (Exception e) { s.setRating(0.0); }
                    suppliers.add(s);
                }
            }
            supplierRepository.saveAll(suppliers);
            System.out.println("====== IMPORTED " + suppliers.size() + " SUPPLIERS ======");
        } catch (Exception e) {
            System.err.println("Error importing suppliers.csv: " + e.getMessage());
        }
    }
}

