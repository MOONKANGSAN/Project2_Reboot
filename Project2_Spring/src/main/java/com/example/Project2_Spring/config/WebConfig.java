package com.example.Project2_Spring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // /api/로 시작하는 모든 주소에 대해
                .allowedOrigins("http://localhost:5173") // 리액트 서버 주소 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드 [cite: 260]
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true); // 쿠키/인증 정보 포함 허용
    }
}