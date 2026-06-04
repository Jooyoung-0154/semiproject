package org.cloud.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String projectPath = System.getProperty("user.dir");
		System.out.println("프로젝트 경로 : " + projectPath);

		String uploadPath = "file:///" + projectPath + "/src/main/resources/static/uploads/";
		String imagePath = "file:///" + projectPath + "/src/main/resources/static/image/";
		
		registry.addResourceHandler("/uploads/**").addResourceLocations(uploadPath).setCachePeriod(3600).resourceChain(true);
		registry.addResourceHandler("/image/**").addResourceLocations(imagePath).setCachePeriod(3600).resourceChain(true);
		registry.addResourceHandler("/resources/static/image/**").addResourceLocations(imagePath).setCachePeriod(3600).resourceChain(true);
	}

}
