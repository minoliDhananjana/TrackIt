package com.trackit.backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.trackit.backend.dto.RegisterRequest;
import com.trackit.backend.enums.Role;
import com.trackit.backend.model.User;
import com.trackit.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register user
    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        // This endpoint manages intern accounts; a client cannot create a
        // privileged account by changing the role in its request body.
        user.setRole(Role.INTERN);
        user.setActive(true);

        userRepository.save(user);

        return "User registered successfully";
    }

    // Login user
    public User login(String email, String password) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return null;
        }

        if (!user.isActive()) {
            return null;
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            return null;
        }

        return user;
    }

    // Get all interns
    public List<User> getAllInterns() {

        List<User> interns =
                userRepository.findByRole(Role.INTERN);

        interns.forEach(
                user -> user.setPassword(null)
        );

        return interns;
    }

    // Update intern
    public User updateIntern(
            String id,
            User updatedIntern) {

        User existingIntern = userRepository
                .findById(id)
                .orElse(null);

        if (existingIntern == null ||
                existingIntern.getRole() != Role.INTERN) {

            return null;
        }

        User emailOwner = userRepository
                .findByEmail(updatedIntern.getEmail())
                .orElse(null);

        if (emailOwner != null &&
                !emailOwner.getId().equals(id)) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        if (updatedIntern.getFullName() == null || updatedIntern.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (updatedIntern.getEmail() == null || updatedIntern.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        existingIntern.setFullName(updatedIntern.getFullName().trim());

        existingIntern.setEmail(
                updatedIntern.getEmail().trim().toLowerCase()
        );

        User savedIntern =
                userRepository.save(existingIntern);

        savedIntern.setPassword(null);

        return savedIntern;
    }

    // Activate or deactivate intern
    public User updateInternStatus(
            String id,
            boolean active) {

        User existingIntern = userRepository
                .findById(id)
                .orElse(null);

        if (existingIntern == null ||
                existingIntern.getRole() != Role.INTERN) {

            return null;
        }

        existingIntern.setActive(active);

        User savedIntern =
                userRepository.save(existingIntern);

        savedIntern.setPassword(null);

        return savedIntern;
    }
}
