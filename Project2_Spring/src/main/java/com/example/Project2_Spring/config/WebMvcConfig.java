package com.example.Project2_Spring.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.restaurant.dir}")
    private String restaurantUploadDir;

    @Value("${app.upload.review.dir}")
    private String reviewUploadDir;

    @Value("${app.upload.user.dir}")
    private String userUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/restaurant/**")
                .addResourceLocations("file:" + restaurantUploadDir + "/");

        registry.addResourceHandler("/uploads/review/**")
                .addResourceLocations("file:" + reviewUploadDir + "/");

        registry.addResourceHandler("/uploads/user/**")
                .addResourceLocations("file:" + userUploadDir + "/");
    }
}
