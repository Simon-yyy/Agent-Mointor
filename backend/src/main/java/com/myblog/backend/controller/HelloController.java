package com.myblog.backend.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 站点问候接口（M1 里程碑）。
 * 用途：验证前后端链路是否联通，前端首页会请求本接口并展示返回内容。
 */
@RestController
@RequestMapping("/api")
public class HelloController {

    /** GET /api/hello：返回站点基本信息 */
    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of(
                "code", 0,
                "message", "hello",
                "data", Map.of(
                        "site", "我的个人站",
                        "message", "你好，这里是亲手从零搭建的个人站——作品仓库 + 心得文章。",
                        "stack", "Spring Boot 4 + Vue 3",
                        "milestone", "M1"
                )
        );
    }
}
