package com.algorithm.visualization.controller;

import com.algorithm.visualization.dto.UserDataDto;
import com.algorithm.visualization.model.User;
import com.algorithm.visualization.service.UserDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-data")
@PreAuthorize("isAuthenticated()")
public class UserDataController {
    @Autowired
    private UserDataService userDataService;

    @GetMapping
    public ResponseEntity<List<UserDataDto>> getAllUserData(@AuthenticationPrincipal User currentUser) {
        List<UserDataDto> userData = userDataService.getAllUserDataByUser(currentUser);
        return ResponseEntity.ok(userData);
    }

    @GetMapping("/type/{dataType}")
    public ResponseEntity<List<UserDataDto>> getUserDataByType(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String dataType) {
        List<UserDataDto> userData = userDataService.getUserDataByType(currentUser, dataType);
        return ResponseEntity.ok(userData);
    }

    @GetMapping("/type/{dataType}/key/{dataKey}")
    public ResponseEntity<UserDataDto> getUserDataByTypeAndKey(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String dataType,
            @PathVariable String dataKey) {
        Optional<UserDataDto> userData = userDataService.getUserDataByTypeAndKey(currentUser, dataType, dataKey);
        return userData.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDataDto> createOrUpdateUserData(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UserDataDto userDataDto) {
        UserDataDto createdOrUpdatedData = userDataService.createOrUpdateUserData(currentUser, userDataDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrUpdatedData);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserData(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        userDataService.deleteUserData(currentUser, id);
        return ResponseEntity.noContent().build();
    }
}