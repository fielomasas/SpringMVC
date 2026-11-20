package com.spring.spring_rest.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.spring.spring_rest.service.CustomUserDetailsService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;

/**
 * Configures HTTP security and authentication-related beans.
 */
@EnableWebSecurity
@Configuration
public class SecurityConfig {

    /** User lookup service used by authentication configuration. */
    private CustomUserDetailsService userDetailsService;

    /**
     * Creates the security configuration with the application user service.
     *
     * @param userDetailsService service that loads users and their roles
     */
    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.setUserDetailsService(userDetailsService);
    }

    /**
     * Creates the filter chain, permitting authentication endpoints and
     * requiring authentication for other requests.
     *
     * @param security HTTP security builder
     * @return configured security filter chain
     * @throws Exception if the security chain cannot be configured
     */
    @Bean
    SecurityFilterChain filterChain(HttpSecurity security) 
            throws Exception {
        return security
                .cors(cors -> cors.configure(security))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                    )   
                .authorizeHttpRequests(auth -> auth
                                    .requestMatchers("/api/auth/**")
                                    .permitAll()
                                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                                    .permitAll()
                                    .requestMatchers("/api/students/**")
                                    .hasAnyAuthority("USER", "ADMIN")
                                    .anyRequest()
                                    .authenticated())
                .httpBasic(Customizer.withDefaults())   
                .build();
    }

    /**
     * Creates the CORS policy for the local frontend and API requests.
     *
     * @return source that applies the CORS policy to all request paths
     */
    @Bean 
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000",
                                                    "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST",
                                                        "PUT", "PATCH",
                                                        "DELETE", "OPTIONS" ));
        configuration.setAllowedHeaders(Arrays.asList("Authorization",
                                                        "Cache-Control",
                                                        "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = 
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /** Creates the BCrypt password encoder used for password hashing. */
    @Bean 
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Obtains the authentication manager configured by Spring Security.
     *
     * @param authentication Spring Security authentication configuration
     * @return configured authentication manager
     * @throws Exception if the authentication manager cannot be created
     */
    @Bean 
    AuthenticationManager authenticationManager
        (AuthenticationConfiguration authentication) throws Exception {
        return authentication.getAuthenticationManager();
    }

    /** Returns the configured database-backed user lookup service. */
    public CustomUserDetailsService getUserDetailsService() {
        return userDetailsService;
    }

    /**
     * Sets the user lookup service used by this configuration.
     * @param userDetailsService service that loads application users
     */
    public void setUserDetailsService(
        CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }
}
