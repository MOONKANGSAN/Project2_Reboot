package com.example.Project2_Spring.service;

import com.example.Project2_Spring.dto.PublicRestaurantDto;
import com.example.Project2_Spring.dto.RestaurantListItemDto;
import com.example.Project2_Spring.entity.RestaurantHashtag;
import com.example.Project2_Spring.entity.RestaurantImg;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.repository.RestaurantHashtagRepository;
import com.example.Project2_Spring.repository.RestaurantImgRepository;
import com.example.Project2_Spring.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantHashtagRepository restaurantHashtagRepository;
    private final RestaurantImgRepository restaurantImgRepository;

    @Transactional
    public restaurant register(restaurant r) {
        if (restaurantRepository.existsByNameAndAddress(r.getName(), r.getAddress())) {
            throw new IllegalStateException("동일한 이름과 주소의 점포가 이미 존재합니다.");
        }
        return restaurantRepository.save(r);
    }

    // 공개 API — 활성 점포 최신순 목록 (해시태그 포함, N+1 없음)
    @Transactional(readOnly = true)
    public List<PublicRestaurantDto> getPublicList() {
        List<restaurant> restaurants = restaurantRepository.findByStateOrderByRegDateDesc(1);
        if (restaurants.isEmpty()) return List.of();

        // 점포 idx 목록으로 해시태그 일괄 조회
        List<Integer> idxList = restaurants.stream()
                .map(restaurant::getIdx)
                .collect(Collectors.toList());

        List<RestaurantHashtag> allHashtags =
                restaurantHashtagRepository.findActiveHashtagsByRestaurantIdxIn(idxList);

        // restaurantIdx 기준으로 해시태그 이름 그루핑
        Map<Integer, List<String>> hashtagMap = allHashtags.stream()
                .collect(Collectors.groupingBy(
                        rh -> rh.getRestaurantEntity().getIdx(),
                        Collectors.mapping(rh -> rh.getHashtag().getName(), Collectors.toList())
                ));

        // 대표 이미지 일괄 조회 (restaurant.img_idx → restaurant_img.img_url)
        List<Integer> imgIdxList = restaurants.stream()
                .map(restaurant::getImgIdx)
                .filter(imgIdx -> imgIdx != null)
                .collect(Collectors.toList());

        Map<Integer, String> imgUrlMap = new HashMap<>();
        if (!imgIdxList.isEmpty()) {
            restaurantImgRepository.findAllById(imgIdxList)
                    .forEach(img -> imgUrlMap.put(img.getIdx(), img.getImgUrl()));
        }

        return restaurants.stream()
                .map(r -> {
                    // img_idx → restaurant_img.img_url 우선, 없으면 restaurant.image_url 사용
                    String imageUrl = (r.getImgIdx() != null && imgUrlMap.containsKey(r.getImgIdx()))
                            ? imgUrlMap.get(r.getImgIdx())
                            : r.getImageUrl();
                    return new PublicRestaurantDto(
                            r.getIdx(),
                            r.getName(),
                            r.getCategory(),
                            r.getAvgRating(),
                            r.getLocation(),
                            r.getPriceRange(),
                            imageUrl,
                            hashtagMap.getOrDefault(r.getIdx(), List.of()),
                            r.getRegDate()
                    );
                })
                .collect(Collectors.toList());
    }

    // 단일 점포 조회
    @Transactional(readOnly = true)
    public RestaurantListItemDto findById(Integer idx) {
        restaurant r = restaurantRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));
        return new RestaurantListItemDto(
                r.getIdx(), r.getName(), r.getCategory(), r.getAddress(),
                r.getLocation(), r.getPhone(), r.getPriceRange(),
                r.getDescription(), r.getImageUrl(), r.getImgIdx(),
                r.getState(), r.getRegDate()
        );
    }

    // 점포 정보 수정
    @Transactional
    public restaurant update(Integer idx, RestaurantListItemDto dto) {
        restaurant r = restaurantRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));
        r.setName(dto.getName());
        r.setCategory(dto.getCategory());
        r.setAddress(dto.getAddress());
        r.setLocation(dto.getLocation());
        r.setPhone(dto.getPhone());
        r.setPriceRange(dto.getPriceRange());
        r.setDescription(dto.getDescription());
        r.setImageUrl(dto.getImageUrl());
        return restaurantRepository.save(r);
    }

    // 점포 상태 토글 (1→0, 0→1)
    @Transactional
    public restaurant toggleState(Integer idx) {
        restaurant r = restaurantRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다."));
        r.setState(r.getState() == 1 ? 0 : 1);
        return restaurantRepository.save(r);
    }

    // 전체 점포 목록 조회 (등록일 내림차순)
    @Transactional(readOnly = true)
    public List<RestaurantListItemDto> getList() {
        return restaurantRepository.findAllByOrderByRegDateDesc()
                .stream()
                .map(r -> new RestaurantListItemDto(
                        r.getIdx(),
                        r.getName(),
                        r.getCategory(),
                        r.getAddress(),
                        r.getLocation(),
                        r.getPhone(),
                        r.getPriceRange(),
                        r.getDescription(),
                        r.getImageUrl(),
                        r.getImgIdx(),
                        r.getState(),
                        r.getRegDate()
                ))
                .collect(Collectors.toList());
    }
}
