package com.trackit.backend.controller;

import com.trackit.backend.dto.LoginRequest;
import com.trackit.backend.dto.LoginResponse;
import com.trackit.backend.dto.RegisterRequest;
import com.trackit.backend.model.User;
import com.trackit.backend.security.JwtService;
import com.trackit.backend.service.UserService;
import com.trackit.backend.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        String result = userService.register(request);

        if ("Email already exists".equals(result)) {
            return ResponseEntity.badRequest().body(result);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {
        User user = userService.login(
                request.getEmail(),
                request.getPassword()
        );

        if (user == null) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/interns")
    public ResponseEntity<List<User>> getAllInterns() {
        return ResponseEntity.ok(userService.getAllInterns());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getProfile() {
        User user = currentUserService.requireCurrentUser();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/interns/{id}")
    public ResponseEntity<?> updateIntern(
            @PathVariable String id,
            @RequestBody User updatedIntern
    ) {
        User intern = userService.updateIntern(id, updatedIntern);

        if (intern == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(intern);
    }

    @PutMapping("/interns/{id}/status")
    public ResponseEntity<?> updateInternStatus(
            @PathVariable String id,
            @RequestParam boolean active
    ) {
        User intern = userService.updateInternStatus(id, active);

        if (intern == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(intern);
    }
}
