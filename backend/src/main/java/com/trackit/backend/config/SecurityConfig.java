package com.trackit.backend.config;

import com.trackit.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Browser CORS preflight requests never contain a JWT.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoint
                        .requestMatchers(
                                "/api/users/login",
                                "/error"
                        ).permitAll()

                        // Admin and supervisor intern management
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/interns/**"
                        ).hasAnyRole("ADMIN", "SUPERVISOR")

                        // Project viewing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projects/**"
                        ).authenticated()

                        // Project creation and editing
                        .requestMatchers(
                                "/api/projects/**"
                        ).hasAnyRole("ADMIN", "SUPERVISOR")

                        // Task viewing and progress updates
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/tasks/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/tasks/*/progress"
                        ).hasRole("INTERN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/tasks/**"
                        ).hasAnyRole("ADMIN", "SUPERVISOR")

                        // Task creation and deletion
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/tasks/**"
                        ).hasAnyRole("ADMIN", "SUPERVISOR")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/tasks/**"
                        ).hasAnyRole("ADMIN", "SUPERVISOR")

                        .requestMatchers(HttpMethod.GET, "/api/worklogs/**", "/api/submissions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/worklogs/**", "/api/submissions/**").hasRole("INTERN")
                        .requestMatchers(HttpMethod.PUT, "/api/worklogs/*/feedback", "/api/submissions/*/review").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers("/api/dashboard/**", "/api/users/me").authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
