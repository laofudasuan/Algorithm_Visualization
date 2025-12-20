package com.algorithm.visualization.dto;

public class AuthResponse {
    private Long id;
    private String username;
    private String nickname;
    private String token;

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getNickname() {
        return nickname;
    }

    public String getToken() {
        return token;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setToken(String token) {
        this.token = token;
    }
}