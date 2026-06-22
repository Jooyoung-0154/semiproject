package org.cloud.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬 개발용 (Windows 경로)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///C:/upload/uploads/");
        // TODO [배포] S3 사용 시 이 핸들러 불필요 — 파일 URL을 S3 직접 링크로 대체
        // EC2 로컬 저장 방식이라면 아래 Linux 경로로 교체
        // .addResourceLocations("file:///home/ubuntu/uploads/");
    }
}
