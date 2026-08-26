package org.cloud.configuration;

import java.nio.file.Paths;

import org.cloud.storage.FileStorageProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    public WebMvcConfig(FileStorageProperties fileStorageProperties) {
        this.fileStorageProperties = fileStorageProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬 개발용 (Windows 경로)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(Paths.get(fileStorageProperties.uploadDir())
                        .toAbsolutePath().normalize().toUri().toString());
        // TODO [배포] S3 사용 시 이 핸들러 불필요 — 파일 URL을 S3 직접 링크로 대체
        // EC2 로컬 저장 방식이라면 아래 Linux 경로로 교체
        // .addResourceLocations("file:///home/ubuntu/uploads/");
    }
}
