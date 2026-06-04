package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Integer> {

    // 이름으로 해시태그 조회 (중복 등록 방지, 재사용)
    Optional<Hashtag> findByName(String name);

    // 존재 여부 확인
    boolean existsByName(String name);

    // 전체 해시태그 목록 (사용 횟수 내림차순 → idx 내림차순)
    List<Hashtag> findAllByOrderByUseCountDescIdxDesc();
}
