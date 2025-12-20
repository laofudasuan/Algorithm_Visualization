package com.algorithm.visualization.repository;

import com.algorithm.visualization.model.UserData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDataRepository extends JpaRepository<UserData, Long> {
    List<UserData> findByUserId(Long userId);
    List<UserData> findByUserIdAndDataType(Long userId, String dataType);
    Optional<UserData> findByUserIdAndDataTypeAndDataKey(Long userId, String dataType, String dataKey);
}