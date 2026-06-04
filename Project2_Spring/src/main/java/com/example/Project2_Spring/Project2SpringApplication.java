package com.example.Project2_Spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling: @Scheduled 어노테이션이 붙은 메서드를 자동 실행
@EnableScheduling
@SpringBootApplication
public class Project2SpringApplication {

	public static void main(String[] args) {
		SpringApplication.run(Project2SpringApplication.class, args);
	}

}
