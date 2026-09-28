package com.myblog.backend.repository;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.myblog.backend.model.Article;
import com.myblog.backend.model.Work;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * 本地数据持久化存储引擎
 * 采用强类型 Jackson + 线程安全读写锁 + 原子化文件写入
 */
@Component
public class DataStorageEngine {

    private static final Logger log = LoggerFactory.getLogger(DataStorageEngine.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final ObjectMapper objectMapper;
    private final Path dataDir;
    private final File articlesFile;
    private final File worksFile;

    private final ReentrantReadWriteLock articleLock = new ReentrantReadWriteLock();
    private final ReentrantReadWriteLock workLock = new ReentrantReadWriteLock();

    public DataStorageEngine(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        // 数据存储在工作目录下的 data 文件夹，确保跨平台与便携
        String userDir = System.getProperty("user.dir");
        Path base = Path.of(userDir);
        if (base.endsWith("backend")) {
            // 如果在 backend 目录下启动，存到上级根目录的 data 目录，保持统一
            this.dataDir = base.getParent().resolve("data");
        } else {
            this.dataDir = base.resolve("data");
        }

        this.articlesFile = dataDir.resolve("articles.json").toFile();
        this.worksFile = dataDir.resolve("works.json").toFile();
    }

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(dataDir)) {
                Files.createDirectories(dataDir);
                log.info("创建数据存储目录: {}", dataDir.toAbsolutePath());
            }

            if (!articlesFile.exists()) {
                seedInitialArticles();
            }

            if (!worksFile.exists()) {
                seedInitialWorks();
            }
        } catch (Exception e) {
            log.error("初始化数据存储引擎失败", e);
        }
    }

    public List<Article> loadArticles() {
        articleLock.readLock().lock();
        try {
            if (!articlesFile.exists()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(articlesFile, new TypeReference<List<Article>>() {});
        } catch (Exception e) {
            log.error("读取文章数据异常", e);
            return new ArrayList<>();
        } finally {
            articleLock.readLock().unlock();
        }
    }

    public void saveArticles(List<Article> articles) {
        articleLock.writeLock().lock();
        try {
            Path tempFile = dataDir.resolve("articles.json.tmp");
            objectMapper.writeValue(tempFile.toFile(), articles);
            Files.move(tempFile, articlesFile.toPath(), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (Exception e) {
            log.error("写入文章数据异常", e);
        } finally {
            articleLock.writeLock().unlock();
        }
    }

    public List<Work> loadWorks() {
        workLock.readLock().lock();
        try {
            if (!worksFile.exists()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(worksFile, new TypeReference<List<Work>>() {});
        } catch (Exception e) {
            log.error("读取作品数据异常", e);
            return new ArrayList<>();
        } finally {
            workLock.readLock().unlock();
        }
    }

    public void saveWorks(List<Work> works) {
        workLock.writeLock().lock();
        try {
            Path tempFile = dataDir.resolve("works.json.tmp");
            objectMapper.writeValue(tempFile.toFile(), works);
            Files.move(tempFile, worksFile.toPath(), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (Exception e) {
            log.error("写入作品数据异常", e);
        } finally {
            workLock.writeLock().unlock();
        }
    }

    private void seedInitialArticles() throws IOException {
        List<Article> seeds = new ArrayList<>();
        String now = LocalDateTime.now().format(FMT);
        String past1 = LocalDateTime.now().minusDays(3).format(FMT);
        String past2 = LocalDateTime.now().minusDays(7).format(FMT);

        seeds.add(new Article(
                1L,
                "搭建一个属于自己的轻量个人博客：架构选型与折腾手记",
                "受够了第三方博客平台的各种限制和广告，花了一周自己搭一个轻量的前后端分离博客。记录一下架构选型和踩坑。",
                """
# 搭建一个属于自己的轻量个人博客：架构选型与折腾手记

主流的托管平台要么改版频繁、要么开始插广告，而且想加点自己定制的小交互（比如作品在线运行、随手记短内容）总是处处受限。静态生成工具（Hugo、Astro、Hexo）虽然轻巧，但每次更新都得本地跑一次构建再推 Git，在手机或外部电脑上想改个错字都很折腾。

权衡之后，决定自己写一个轻量的前后端分离小站，核心诉求只有两个：**自己完全掌控**、**维护成本足够低**。

## 技术选型怎么定？

- **后端**：Spring Boot 3.3 + Java 21。选用轻量 JSON 原子引擎作为持久层，不配复杂的数据库，开箱即用，几十兆内存就能跑得飞快。
- **前端**：Vue 3 + Vite。原生 CSS 变量自适应暗色模式，不堆臃肿的 UI 库，让页面像书本一样轻快干净。
- **部署**：单一可执行 Jar 包，配合前端静态构建产物，日常基本不需要操心。

## 统一返回体结构

接口通信遵循最简单的设计，不搞复杂的嵌套装箱：

```java
public record Result<T>(int code, String message, T data) {
    public static <T> Result<T> success(T data) {
        return new Result<>(0, "ok", data);
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
}
```

## 总结

折腾这一圈下来，虽然花了一个周末的闲暇时间，但看着清清爽爽、没有任何干扰的阅读界面，觉得这趟折腾还是很值的。代码仓库开源在 GitHub，随缘更新。
                """,
                "",
                "架构设计",
                List.of("全栈", "架构"),
                1,
                138L,
                past2,
                past2
        ));

        seeds.add(new Article(
                2L,
                "Java 21 虚拟线程在压测下的实际表现与踩坑记录",
                "把服务切到 Java 21 跑了阵子，用 wrk 压了下 5 万长连接，顺带把 carrier 线程被 synchronized 锁死的教训记录一下。",
                """
# Java 21 虚拟线程在压测下的实际表现与踩坑记录

升级到 Java 21 后，最期待的自然是虚拟线程（Virtual Threads）。过去做高并发 IO 密集型服务，要么开一大堆操作系统线程把内存撑爆，要么写恶心难调试的响应式异步回调。

虚拟线程把这两种做法的优点结合起来了：写同步阻塞的代码，底层享受异步的吞吐量。

## 简单使用

在 Java 21 里启动虚拟线程极其简单：

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}
```

## 压测踩坑：Carrier 线程锁死 (Pinning)

初次接入后，用 `wrk -t12 -c50000 -d30s` 压测时发现 QPS 并没有预想中的暴涨，反而偶尔卡死。
排查后发现是某个老的序列化工具库内部用了 `synchronized` 关键字保护锁，导致底层载体（Carrier）操作系统线程被 Pin 住，无法让出执行权。

**解决方法**：将老代码中的 `synchronized` 统一替换为 `ReentrantLock`：

```java
private final ReentrantLock lock = new ReentrantLock();

public void doSomething() {
    lock.lock();
    try {
        // 阻塞操作
    } finally {
        lock.unlock();
    }
}
```

另外记住一点：**千万不要对虚拟线程搞池化**（ThreadPool），虚拟线程创建成本极低，用完即扔即可。
                """,
                "",
                "后端技术",
                List.of("Java", "并发"),
                1,
                265L,
                past1,
                past1
        ));

        seeds.add(new Article(
                3L,
                "Vue 3 组合式 API 的代码组织心得：怎么避免写成面条代码",
                "从 Options API 切到组合式 API 之后，很容易把代码写成一千多行的面条。记几个日常用来拆分和组织逻辑的小习惯。",
                """
# Vue 3 组合式 API 的代码组织心得：怎么避免写成面条代码

刚接触 Vue 3 `<script setup>` 的时候，大家都很开心：不用在 `data`、`methods`、`computed` 之间反复横跳了。但写着写着很容易走入另一个极端——所有的 `ref`、函数、`watch` 混在一个文件里，滚轮滑不到头，成了典型的“面条代码”。

分享两个日常开发中坚持的组织原则：

## 1. 业务逻辑按功能内聚（Composable）

不要把所有状态都直接摊在组件顶层。超过 20 行且有独立上下文的逻辑，抽取成单个 hook：

```javascript
// hooks/useWindowSize.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const update = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}
```

## 2. 区分 UI 状态与业务数据

- UI 状态（比如弹窗显隐、当前展开的 Tab、加载状态）：留在单文件组件里。
- 数据操作与请求（分页、过滤、缓存）：收敛到具体的 API/Service 层或状态 Store 中。

保持单个 Vue 文件的 script 部分在 150 行以内，读起来会舒服非常多。
                """,
                "",
                "前端工程",
                List.of("Vue 3", "前端"),
                1,
                95L,
                now,
                now
        ));

        saveArticles(seeds);
        log.info("成功初始化种子文章数据 ({} 篇)", seeds.size());
    }

    private void seedInitialWorks() throws IOException {
        List<Work> seeds = new ArrayList<>();
        String now = LocalDateTime.now().format(FMT);

        seeds.add(new Work(
                1L,
                "极简个人全栈博客",
                "用 Spring Boot 3 + Vue 3 写的轻量个人站，去掉了臃肿的三方组件库，自适应明暗主题，本地持久化零运维负担。",
                "",
                "http://localhost:5180",
                "https://github.com/myblog/blog-system",
                List.of("Spring Boot 3", "Vue 3", "Java 21"),
                1,
                now
        ));

        seeds.add(new Work(
                2L,
                "轻量 Markdown 在线编辑器",
                "支持实时分屏预览、代码高亮、大纲定位和本地草稿自动暂存的轻量写作小工具。",
                "",
                "http://localhost:5180/admin/articles/new",
                "https://github.com/myblog/web-markdown-editor",
                List.of("Vue 3", "Markdown"),
                2,
                now
        ));

        seeds.add(new Work(
                3L,
                "HTTP 接口并发压测工具",
                "基于 Java 21 虚拟线程编写的简单压测脚本，用于快速摸清高并发 IO 密集型接口的吞吐量瓶颈。",
                "",
                "http://localhost:5180/works",
                "https://github.com/myblog/concurrency-dashboard",
                List.of("Java 21", "虚拟线程"),
                3,
                now
        ));

        saveWorks(seeds);
        log.info("成功初始化种子作品数据 ({} 个)", seeds.size());
    }
}
