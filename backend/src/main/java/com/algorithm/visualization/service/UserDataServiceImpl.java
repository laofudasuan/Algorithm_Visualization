package com.algorithm.visualization.service;

import com.algorithm.visualization.dto.UserDataDto;
import com.algorithm.visualization.model.User;
import com.algorithm.visualization.model.UserData;
import com.algorithm.visualization.repository.UserDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserDataServiceImpl implements UserDataService {
    @Autowired
    private UserDataRepository userDataRepository;

    @Override
    public List<UserDataDto> getAllUserDataByUser(User user) {
        return userDataRepository.findByUserId(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDataDto> getUserDataByType(User user, String dataType) {
        return userDataRepository.findByUserIdAndDataType(user.getId(), dataType)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<UserDataDto> getUserDataByTypeAndKey(User user, String dataType, String dataKey) {
        return userDataRepository.findByUserIdAndDataTypeAndDataKey(user.getId(), dataType, dataKey)
                .map(this::convertToDto);
    }

    @Override
    public UserDataDto createOrUpdateUserData(User user, UserDataDto userDataDto) {
        // Check if data already exists
        Optional<UserData> existingData = userDataRepository.findByUserIdAndDataTypeAndDataKey(
                user.getId(),
                userDataDto.getDataType(),
                userDataDto.getDataKey()
        );

        UserData userData;
        if (existingData.isPresent()) {
            // Update existing data
            userData = existingData.get();
            userData.setDataContent(userDataDto.getDataContent());
        } else {
            // Create new data
            userData = new UserData();
            userData.setUser(user);
            userData.setDataType(userDataDto.getDataType());
            userData.setDataKey(userDataDto.getDataKey());
            userData.setDataContent(userDataDto.getDataContent());
        }

        UserData savedData = userDataRepository.save(userData);
        return convertToDto(savedData);
    }

    @Override
    public void deleteUserData(User user, Long id) {
        Optional<UserData> userData = userDataRepository.findById(id);
        if (userData.isPresent() && userData.get().getUser().getId().equals(user.getId())) {
            userDataRepository.delete(userData.get());
        }
    }

    private UserDataDto convertToDto(UserData userData) {
        UserDataDto dto = new UserDataDto();
        dto.setId(userData.getId());
        dto.setDataType(userData.getDataType());
        dto.setDataKey(userData.getDataKey());
        dto.setDataContent(userData.getDataContent());
        return dto;
    }
}