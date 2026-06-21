package org.cloud.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            
            // 3. URL별 접근 권한 설정하기
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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
                .requestMatchers("/api/like/**").permitAll()
                .requestMatchers("/api/cart/**").permitAll()
                .requestMatchers("/api/purchase/**").permitAll()
                .requestMatchers("/api/review/**").permitAll()
                .requestMatchers("/api/reviews/**").permitAll()
                .requestMatchers("/api/review-images/**").permitAll()
                .requestMatchers("/api/ai/**").permitAll()
                .requestMatchers("/resources/static/image/**").permitAll()
                .requestMatchers("/api/notifications/**").permitAll()
                .requestMatchers("/api/member-bg-images/**").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() { // ★ 안전하게 public 추가
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // TODO [배포] 위 localhost 대신 실제 프론트엔드 도메인으로 교체
        // 예) "https://내도메인.com" 또는 CloudFront URL "https://xxxx.cloudfront.net"
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
