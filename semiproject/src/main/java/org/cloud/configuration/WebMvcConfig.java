package org.cloud.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String projectPath = System.getProperty("user.dir");

        /*
         * 이미지 업로드 경로 통일
         * - 새로 업로드되는 파일: C:/upload/
         * - 기존에 저장된 파일: src/main/resources/static/uploads/
         * 두 경로를 모두 /uploads/** 로 열어두면 기존 데이터와 신규 데이터 모두 화면에 표시됨.
         */
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        "file:///C:/upload/",
                        "file:///" + projectPath + "/src/main/resources/static/uploads/"
                );

        registry.addResourceHandler("/image/**")
                .addResourceLocations("file:///" + projectPath + "/src/main/resources/static/image/");
    }
}
