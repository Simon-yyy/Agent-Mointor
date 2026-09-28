package com.myblog.backend.config;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.nio.charset.StandardCharsets;

/**
 * 强制所有 JSON 响应头输出 Content-Type: application/json;charset=UTF-8
 * 根治 Windows PowerShell 5.1 (Invoke-RestMethod) 等客户端因缺少显式 charset 回落至 ISO-8859-1 (Latin-1) 导致的中文乱码
 */
@ControllerAdvice
public class JsonCharsetResponseAdvice implements ResponseBodyAdvice<Object> {

    private static final MediaType UTF8_JSON = new MediaType("application", "json", StandardCharsets.UTF_8);

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (selectedContentType != null && MediaType.APPLICATION_JSON.includes(selectedContentType)) {
            response.getHeaders().setContentType(UTF8_JSON);
        }
        return body;
    }
}
