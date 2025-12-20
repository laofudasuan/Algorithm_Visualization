package com.algorithm.visualization.service;

import com.algorithm.visualization.dto.AuthResponse;
import com.algorithm.visualization.dto.LoginRequest;
import com.algorithm.visualization.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
}