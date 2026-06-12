package com.example.Project2_Spring.service;

import com.example.Project2_Spring.dto.InquiryListItemDto;
import com.example.Project2_Spring.dto.InquiryWriteDto;
import com.example.Project2_Spring.entity.Inquiry;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.repository.InquiryRepository;
import com.example.Project2_Spring.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository    inquiryRepository;
    private final UserInfoRepository   userInfoRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // 문의유형 코드 → 한글명 매핑
    private static final Map<Integer, String> TYPE_NAMES = Map.of(
            1, "회원/계정 문의",
            2, "리뷰 관련",
            3, "맛집 정보",
            4, "서비스 이용",
            5, "결제/환불",
            6, "앱 오류/버그",
            7, "개인정보 처리",
            8, "제휴/광고",
            9, "기타"
    );

    // 처리 상태 코드 → 한글명 매핑
    private static final Map<Integer, String> STATE_NAMES = Map.of(
            0, "대기중",
            1, "처리중",
            2, "완료",
            3, "기각"
    );

    // 문의 작성
    @Transactional
    public Inquiry write(InquiryWriteDto dto) {
        if (!StringUtils.hasText(dto.getTitle()))   throw new IllegalArgumentException("제목을 입력해주세요.");
        if (!StringUtils.hasText(dto.getContent())) throw new IllegalArgumentException("문의 내용을 입력해주세요.");
        if (dto.getInquiryType() == null || dto.getInquiryType() < 1 || dto.getInquiryType() > 9)
            throw new IllegalArgumentException("유효하지 않은 문의 유형입니다.");

        Inquiry inquiry = new Inquiry();

        // 로그인 사용자이면 작성자 연결
        if (StringUtils.hasText(dto.getUserId())) {
            UserInfo user = userInfoRepository.findByUserId(dto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
            inquiry.setUserEntity(user);
        }

        // 비공개 문의에 비밀번호 암호화 저장
        if (dto.getIsPublic() != null && dto.getIsPublic() == 0
                && StringUtils.hasText(dto.getPassword())) {
            inquiry.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        inquiry.setTitle(dto.getTitle());
        inquiry.setContent(dto.getContent());
        inquiry.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : 1);
        inquiry.setInquiryType(dto.getInquiryType());

        return inquiryRepository.save(inquiry);
    }

    // 내 문의 목록 조회
    @Transactional(readOnly = true)
    public List<InquiryListItemDto> getMyList(String userId) {
        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return inquiryRepository.findByUserEntityIdxOrderByRegDateDesc(user.getIdx())
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    // 공개 문의 목록 조회
    @Transactional(readOnly = true)
    public List<InquiryListItemDto> getPublicList() {
        return inquiryRepository.findByIsPublicOrderByRegDateDesc(1)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    // Inquiry → InquiryListItemDto 변환
    private InquiryListItemDto toListItem(Inquiry inq) {
        return new InquiryListItemDto(
                inq.getIdx(),
                inq.getState(),
                STATE_NAMES.getOrDefault(inq.getState(), "알 수 없음"),
                inq.getTitle(),
                inq.getIsPublic(),
                inq.getInquiryType(),
                TYPE_NAMES.getOrDefault(inq.getInquiryType(), "기타"),
                inq.getAnswerContent() != null,
                inq.getRegDate()
        );
    }
}
