package org.cloud.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2. CSRF 보호 기능 끄기
            .csrf(csrf -> csrf.disable())
            
            // 3. URL별 접근 권한 설정하기
            .authorizeHttpRequests(auth -> auth
            	// OPTIONS 메서드 무조건 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 리퀘스트 허용하기
                .requestMatchers("/api/member/**").permitAll()
                .requestMatchers("/api/posts/**").permitAll()
                .requestMatchers("/api/guestbook/**").permitAll()
                .requestMatchers("/api/social/**").permitAll()
                .requestMatchers("/api/recipe/**").permitAll()
                .requestMatchers("/api/recipe-images/**").permitAll()
                .requestMatchers("/image/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/tags/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                
                .anyRequest().authenticated()
            );

        return http.build();
    }

    // CORS 세부 규칙을 정의하는 Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() { // ★ 안전하게 public 추가
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}