package com.myblog.backend;

import com.myblog.backend.common.PageResult;
import com.myblog.backend.common.Result;
import com.myblog.backend.dto.LoginDto;
import com.myblog.backend.model.Article;
import com.myblog.backend.model.Work;
import com.myblog.backend.service.ArticleService;
import com.myblog.backend.service.AuthService;
import com.myblog.backend.service.WorkService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

@SpringBootTest
class BlogBackendApplicationTests {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private WorkService workService;

    @Autowired
    private AuthService authService;

    @Test
    void testContextAndDataLoaded() {
        // 1. 验证文章数据播种与已发布文章分页查询
        PageResult<Article> paged = articleService.listPublishedArticles(null, null, null, 1, 10);
        Assertions.assertNotNull(paged);
        Assertions.assertTrue(paged.getTotal() >= 3, "初始播种文章数应不少于3篇");
        Assertions.assertFalse(paged.getList().isEmpty());

        // 2. 验证文章详情与阅读量自增
        Article first = paged.getList().get(0);
        long initialViews = first.getViews() != null ? first.getViews() : 0L;
        Article detail = articleService.getArticleById(first.getId(), true);
        Assertions.assertEquals(initialViews + 1, detail.getViews(), "阅读量应自动自增");

        // 3. 验证作品模块
        List<Work> works = workService.listWorks();
        Assertions.assertNotNull(works);
        Assertions.assertTrue(works.size() >= 3, "初始作品数应不少于3个");

        // 4. 验证分类与标签聚合
        Map<String, Long> categories = articleService.getCategories();
        Assertions.assertFalse(categories.isEmpty());

        // 5. 验证管理员登录与 Token
        LoginDto.LoginRequest loginReq = new LoginDto.LoginRequest();
        loginReq.setUsername("admin");
        loginReq.setPassword("admin123");
        LoginDto.LoginResponse loginRes = authService.login(loginReq);
        Assertions.assertNotNull(loginRes);
        Assertions.assertNotNull(loginRes.getToken());
        Assertions.assertTrue(authService.validateToken(loginRes.getToken()), "生成的Token应合法有效");
    }
}
