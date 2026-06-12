package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Integer> {

    // 특정 회원의 문의 목록 (최신순)
    List<Inquiry> findByUserEntityIdxOrderByRegDateDesc(Integer userIdx);

    // 공개 문의 전체 목록 (최신순)
    List<Inquiry> findByIsPublicOrderByRegDateDesc(Integer isPublic);
}
