package com.b2b.inventory.controller;

import com.b2b.inventory.entity.User;
import com.b2b.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/me")
    public Map<String, String> updateProfile(@RequestBody Map<String, String> payload, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (payload.containsKey("name")) {
            user.setName(payload.get("name"));
        }
        
        userRepository.save(user);
        return Map.of("message", "Profile updated successfully", "name", user.getName());
    }
}
