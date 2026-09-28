package com.myblog.backend.service;

import com.myblog.backend.common.BusinessException;
import com.myblog.backend.dto.LoginDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * 认证与安全 Token 服务
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String HMAC_ALGO = "HmacSHA256";
    private static final long EXPIRE_MILLIS = 7L * 24 * 60 * 60 * 1000; // 7 天有效

    @Value("${blog.admin.username:admin}")
    private String adminUsername;

    @Value("${blog.admin.password:admin123}")
    private String adminPassword;

    @Value("${blog.auth.secret:MyBlogSecureJwtTokenSecretKey2026!}")
    private String secretKey;

    public LoginDto.LoginResponse login(LoginDto.LoginRequest request) {
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        long expireAt = System.currentTimeMillis() + EXPIRE_MILLIS;
        String token = generateToken(adminUsername, expireAt);

        log.info("管理员 [{}] 登录成功", adminUsername);
        return new LoginDto.LoginResponse(token, adminUsername, "ROLE_ADMIN", EXPIRE_MILLIS / 1000);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }
            String username = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            long expireAt = Long.parseLong(new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8));
            String signature = parts[2];

            if (System.currentTimeMillis() > expireAt) {
                log.warn("Token 已过期");
                return false;
            }

            String expectedSig = sign(parts[0] + "." + parts[1]);
            return MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8), expectedSig.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.warn("Token 校验失败: {}", e.getMessage());
            return false;
        }
    }

    private String generateToken(String username, long expireAt) {
        String part1 = Base64.getUrlEncoder().withoutPadding().encodeToString(username.getBytes(StandardCharsets.UTF_8));
        String part2 = Base64.getUrlEncoder().withoutPadding().encodeToString(String.valueOf(expireAt).getBytes(StandardCharsets.UTF_8));
        String payload = part1 + "." + part2;
        String signature = sign(payload);
        return payload + "." + signature;
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGO);
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("生成签名异常", e);
        }
    }
}
