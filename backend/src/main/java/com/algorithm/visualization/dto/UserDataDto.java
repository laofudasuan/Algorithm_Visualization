package com.algorithm.visualization.dto;

public class UserDataDto {
    private Long id;
    private String dataType;
    private String dataKey;
    private String dataContent;

    // Getters
    public Long getId() {
        return id;
    }

    public String getDataType() {
        return dataType;
    }

    public String getDataKey() {
        return dataKey;
    }

    public String getDataContent() {
        return dataContent;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public void setDataKey(String dataKey) {
        this.dataKey = dataKey;
    }

    public void setDataContent(String dataContent) {
        this.dataContent = dataContent;
    }
}