package com.example.Project2_Spring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        // CORS 설정 객체 생성
        CorsConfiguration config = new CorsConfiguration();

        // 자격증명(쿠키, 인증 헤더) 허용
        config.setAllowCredentials(true);

        // 허용할 Origin 설정 (프론트엔드 주소)
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        config.addAllowedOrigin("http://localhost:3000"); // 필요시 추가

        // 모든 HTTP 메서드 허용
        config.addAllowedMethod("*");

        // 모든 헤더 허용
        config.addAllowedHeader("*");

        // Preflight 요청 결과 캐싱 시간 (3600초)
        config.setMaxAge(3600L);

        // URL 패턴에 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
