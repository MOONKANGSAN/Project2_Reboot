package com.example.Project2_Spring.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.restaurant.dir}")
    private String restaurantUploadDir;

    // /uploads/restaurant/** 요청을 로컬 파일 시스템 경로로 매핑
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/restaurant/**")
                .addResourceLocations("file:" + restaurantUploadDir + "/");
    }
}
