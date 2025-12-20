package com.algorithm.visualization.service;

import com.algorithm.visualization.dto.UserDataDto;
import com.algorithm.visualization.model.User;
import com.algorithm.visualization.model.UserData;

import java.util.List;
import java.util.Optional;

public interface UserDataService {
    List<UserDataDto> getAllUserDataByUser(User user);
    List<UserDataDto> getUserDataByType(User user, String dataType);
    Optional<UserDataDto> getUserDataByTypeAndKey(User user, String dataType, String dataKey);
    UserDataDto createOrUpdateUserData(User user, UserDataDto userDataDto);
    void deleteUserData(User user, Long id);
}