package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.UserInfo; // 위에서 만든 Entity 임포트
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Integer> {

    // 1. 로그인할 때 ID로 사용자 정보를 가져오기 위한 메소드
    // SELECT * FROM user_info WHERE user_id = ? 쿼리가 자동으로 생성됩니다.
    Optional<UserInfo> findByUserId(String userId);

    // 2. 회원가입 시 이미 존재하는 아이디인지 확인하기 위한 메소드
    boolean existsByUserId(String userId);

    // 3. 휴대폰 번호로 사용자 찾기 (필요 시)
    Optional<UserInfo> findByPhoneNumber(String phoneNumber);

}
