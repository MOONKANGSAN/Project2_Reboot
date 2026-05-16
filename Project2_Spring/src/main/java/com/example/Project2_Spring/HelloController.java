package com.example.Project2_Spring; // 이 클래스가 속한 패키지 경로를 선언합니다.

import org.springframework.web.bind.annotation.GetMapping; // HTTP GET 요청을 특정 메서드에 매핑하기 위한 어노테이션을 가져옵니다.
import org.springframework.web.bind.annotation.RestController; // 이 클래스가 RESTful 웹 서비스의 컨트롤러임을 나타내는 어노테이션을 가져옵니다.

@RestController // 이 클래스의 모든 메서드가 뷰(화면)가 아닌 객체 데이터(주로 JSON/문자열)를 직접 반환하도록 설정합니다.
public class HelloController { // 외부에서 접근 가능한 HelloController 클래스를 선언합니다.

    @GetMapping("/api/test") // "/api/test" 경로로 들어오는 GET 방식의 웹 요청을 아래 메서드와 연결합니다.
    public String hello() { // 클라이언트에게 문자열 객체를 반환하는 hello 메서드를 정의합니다.
        return "Spring 백엔드 서버가 성공적으로 실행되었습니다!"; // 요청 성공 시 클라이언트(브라우저 또는 React)에 이 문자열을 반환합니다.
    } // 메서드의 끝을 나타냅니다.

} // 클래스의 끝을 나타냅니다.