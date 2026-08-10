package com.trackit.backend.config;

import com.trackit.backend.enums.Role;
import com.trackit.backend.model.User;
import com.trackit.backend.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates or resets development login accounts only when explicitly enabled.
 * Credentials are supplied through environment variables and are never stored
 * in source control.
 */
@Component
public class BootstrapUsersConfig implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public BootstrapUsersConfig(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Environment environment
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!Boolean.parseBoolean(environment.getProperty("trackit.bootstrap.enabled", "false"))) {
            return;
        }

        upsert("ADMIN", Role.ADMIN);
        upsert("INTERN", Role.INTERN);
    }

    private void upsert(String prefix, Role role) {
        String email = required("TRACKIT_" + prefix + "_EMAIL");
        String password = required("TRACKIT_" + prefix + "_PASSWORD");
        String name = environment.getProperty("TRACKIT_" + prefix + "_NAME", role == Role.ADMIN ? "TrackIt Administrator" : "TrackIt Intern");

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setFullName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }

    private String required(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(key + " is required when TrackIt bootstrap is enabled");
        }
        return value;
    }
}
