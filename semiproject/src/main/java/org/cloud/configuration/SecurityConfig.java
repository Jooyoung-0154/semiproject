package org.cloud.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.cloud.exception.ApiErrorResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper;

    public SecurityConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            
            // 3. URL별 접근 권한 설정하기
            .authorizeHttpRequests(auth -> auth
                // 1. 브라우저 CORS 사전 요청
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 2. 로그인 전에도 필요한 요청
                .requestMatchers(HttpMethod.POST,
                    "/api/member/register",
                    "/api/member/login").permitAll()

                // 3. 관리자 전용 요청
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/tags/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tags/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tags/**").hasRole("ADMIN")

                // 4. /me는 공개 프로필의 {id} 패턴보다 먼저 보호
                .requestMatchers("/api/member/me").authenticated()

                // 5. 홈, 검색, 레시피 상세 화면 공개 조회
                .requestMatchers(HttpMethod.GET,
                    "/api/recipe/browse",
                    "/api/recipe/list",
                    "/api/recipe/tags",
                    "/api/recipe/{recipeId}",
                    "/api/recipe-images/{recipeCode}",
                    "/api/reviews/recipe/{recipeCode}",
                    "/api/review-images/recipe/{recipeCode}",
                    "/api/member/search",
                    "/api/member/{id}").permitAll()

                // 6. 공개 상세 화면의 조회수 증가
                .requestMatchers(HttpMethod.PUT, "/api/recipe/{recipeId}/hit").permitAll()

                // 7. 화면 표시용 정적 파일
                .requestMatchers("/image/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/resources/static/image/**").permitAll()
                .requestMatchers("/error").permitAll()

                // 8. 위에서 허용하지 않은 모든 요청은 로그인 필요
                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) ->
                    writeSecurityErrorResponse(
                        response,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "UNAUTHORIZED",
                        "로그인이 필요합니다."
                    ))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeSecurityErrorResponse(
                        response,
                        HttpServletResponse.SC_FORBIDDEN,
                        "FORBIDDEN",
                        "접근 권한이 없습니다."
                    ))
            );

        return http.build();
    }

    private void writeSecurityErrorResponse(
            HttpServletResponse response,
            int status,
            String code,
            String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
            response.getWriter(),
            new ApiErrorResponse(status, code, message)
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
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
