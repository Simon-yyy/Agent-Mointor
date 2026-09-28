package com.myblog.backend.controller;

import com.myblog.backend.common.Result;
import com.myblog.backend.dto.LoginDto;
import com.myblog.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 身份认证控制器
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public Result<LoginDto.LoginResponse> login(@Valid @RequestBody LoginDto.LoginRequest request) {
        return Result.success(authService.login(request));
    }

    /**
     * 校验当前 Token 状态
     */
    @GetMapping("/check")
    public Result<Map<String, Object>> checkToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        boolean valid = authService.validateToken(token);
        return Result.success(Map.of("authenticated", valid));
    }
}
