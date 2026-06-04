package com.example.Project2_Spring.service;

import com.example.Project2_Spring.dto.HashtagMasterDto;
import com.example.Project2_Spring.dto.HashtagResponseDto;
import com.example.Project2_Spring.entity.Hashtag;
import com.example.Project2_Spring.entity.RestaurantHashtag;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.repository.HashtagRepository;
import com.example.Project2_Spring.repository.RestaurantHashtagRepository;
import com.example.Project2_Spring.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantHashtagService {

    private final RestaurantRepository restaurantRepository;
    private final HashtagRepository hashtagRepository;
    private final RestaurantHashtagRepository restaurantHashtagRepository;

    /**
     * 점포의 해시태그를 newTagNames 목록 기준으로 동기화한다.
     * - hashtag 마스터 테이블: 동일 키워드는 단 1건만 유지 (findByName → 없으면 신규 생성)
     * - 제거 태그: use_count 감소
     * - 추가 태그: use_count 증가
     */
    @Transactional
    public void syncHashtags(Integer restaurantIdx, List<String> newTagNames) {
        // 빈 목록 허용 (전체 태그 제거 케이스)
        Set<String> newNames = (newTagNames == null ? List.<String>of() : newTagNames)
                .stream()
                .map(t -> t.trim().replaceAll("^#", ""))
                .filter(t -> !t.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        // 현재 등록된 태그 Map<태그명, RestaurantHashtag>
        List<RestaurantHashtag> current =
                restaurantHashtagRepository.findActiveHashtagsWithTagByRestaurantIdx(restaurantIdx);
        Map<String, RestaurantHashtag> currentMap = current.stream()
                .collect(Collectors.toMap(rh -> rh.getHashtag().getName(), rh -> rh));

        // ── 제거: 현재 있지만 새 목록에 없는 태그
        for (Map.Entry<String, RestaurantHashtag> entry : currentMap.entrySet()) {
            if (!newNames.contains(entry.getKey())) {
                RestaurantHashtag rh = entry.getValue();
                Hashtag h = rh.getHashtag();
                restaurantHashtagRepository.delete(rh);
                if (h.getUseCount() > 0) {
                    h.setUseCount(h.getUseCount() - 1);
                    hashtagRepository.save(h);
                }
            }
        }

        // ── 추가: 새 목록에 있지만 현재 없는 태그
        if (!newNames.isEmpty()) {
            restaurant r = restaurantRepository.findById(restaurantIdx)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));

            for (String tagName : newNames) {
                if (currentMap.containsKey(tagName)) continue; // 이미 존재하면 건너뜀

                // 마스터 테이블에서 동일 키워드 조회 → 없으면 신규 생성 (중복 방지)
                Hashtag hashtag = hashtagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Hashtag newTag = new Hashtag();
                            newTag.setName(tagName);
                            return hashtagRepository.save(newTag);
                        });

                RestaurantHashtag rh = new RestaurantHashtag();
                rh.setRestaurantEntity(r);
                rh.setHashtag(hashtag);
                restaurantHashtagRepository.save(rh);

                hashtag.setUseCount(hashtag.getUseCount() + 1);
                hashtagRepository.save(hashtag);
            }
        }
    }

    // 해시태그 마스터 전체 목록 조회 (사용 횟수 내림차순)
    @Transactional(readOnly = true)
    public List<HashtagMasterDto> getMasterList() {
        return hashtagRepository.findAllByOrderByUseCountDescIdxDesc()
                .stream()
                .map(h -> new HashtagMasterDto(
                        h.getIdx(),
                        h.getName(),
                        h.getUseCount(),
                        h.getRegDate()
                ))
                .collect(Collectors.toList());
    }

    // 점포의 활성 해시태그 목록 조회
    @Transactional(readOnly = true)
    public List<HashtagResponseDto> getHashtags(Integer restaurantIdx) {
        return restaurantHashtagRepository
                .findActiveHashtagsWithTagByRestaurantIdx(restaurantIdx)
                .stream()
                .map(rh -> new HashtagResponseDto(
                        rh.getIdx(),
                        rh.getHashtag().getIdx(),
                        rh.getHashtag().getName(),
                        rh.getState(),
                        rh.getRegDate()
                ))
                .collect(Collectors.toList());
    }

    // 점포에 해시태그 등록 (없으면 마스터 테이블에도 신규 생성)
    @Transactional
    public HashtagResponseDto addHashtag(Integer restaurantIdx, String tagName) {
        String normalizedName = tagName.trim();
        if (normalizedName.isEmpty()) {
            throw new IllegalArgumentException("태그 이름을 입력해주세요.");
        }

        restaurant r = restaurantRepository.findById(restaurantIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));

        // 해시태그 마스터: 없으면 신규 생성, 있으면 재사용
        Hashtag hashtag = hashtagRepository.findByName(normalizedName)
                .orElseGet(() -> {
                    Hashtag newTag = new Hashtag();
                    newTag.setName(normalizedName);
                    return hashtagRepository.save(newTag);
                });

        // 이미 이 점포에 등록된 태그인지 확인
        if (restaurantHashtagRepository.existsByRestaurantEntityIdxAndHashtagIdx(
                restaurantIdx, hashtag.getIdx())) {
            throw new IllegalStateException("이미 등록된 해시태그입니다.");
        }

        RestaurantHashtag rh = new RestaurantHashtag();
        rh.setRestaurantEntity(r);
        rh.setHashtag(hashtag);
        RestaurantHashtag saved = restaurantHashtagRepository.save(rh);

        // 사용 횟수 증가
        hashtag.setUseCount(hashtag.getUseCount() + 1);
        hashtagRepository.save(hashtag);

        return new HashtagResponseDto(
                saved.getIdx(), hashtag.getIdx(),
                hashtag.getName(), saved.getState(), saved.getRegDate()
        );
    }

    // 해시태그 이름 수정 (hashtag 마스터 테이블 업데이트)
    @Transactional
    public HashtagResponseDto updateHashtag(Integer hashtagIdx, String newName) {
        String normalizedName = newName.trim();
        if (normalizedName.isEmpty()) {
            throw new IllegalArgumentException("태그 이름을 입력해주세요.");
        }

        Hashtag hashtag = hashtagRepository.findById(hashtagIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 해시태그입니다."));

        // 변경하려는 이름이 이미 다른 태그에 존재하는지 확인
        if (!hashtag.getName().equals(normalizedName) &&
                hashtagRepository.existsByName(normalizedName)) {
            throw new IllegalStateException("이미 존재하는 태그명입니다: " + normalizedName);
        }

        hashtag.setName(normalizedName);
        Hashtag updated = hashtagRepository.save(hashtag);

        return new HashtagResponseDto(null, updated.getIdx(), updated.getName(), null, null);
    }

    // 점포에서 해시태그 삭제 (restaurant_hashtag 레코드 제거)
    @Transactional
    public void removeHashtag(Integer restaurantHashtagIdx) {
        RestaurantHashtag rh = restaurantHashtagRepository.findById(restaurantHashtagIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 태그 연결입니다."));

        Hashtag hashtag = rh.getHashtag();
        restaurantHashtagRepository.delete(rh);

        // 사용 횟수 감소 (0 미만 방지)
        if (hashtag.getUseCount() > 0) {
            hashtag.setUseCount(hashtag.getUseCount() - 1);
            hashtagRepository.save(hashtag);
        }
    }
}
