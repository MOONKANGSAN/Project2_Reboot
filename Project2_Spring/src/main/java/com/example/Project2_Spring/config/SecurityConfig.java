package com.example.Project2_Spring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 비밀번호 암호화 객체 등록 [cite: 35, 81]
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 초기 API 테스트를 위해 보안 필터에서 인증 없이 접근 허용 설정 [cite: 37]
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // API 테스트를 위해 CSRF 비활성화
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // 모든 요청 허용 (추후 권한 설정 필요)
                );
        return http.build();
    }
}