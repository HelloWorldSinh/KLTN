package com.example.be_hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseObject {
    private boolean status; // true for success, false for failure
    private String message;
    private Object data;

    public ResponseObject(boolean status, String message) {
        this.status = status;
        this.message = message;
        this.data = null;
    }
}
