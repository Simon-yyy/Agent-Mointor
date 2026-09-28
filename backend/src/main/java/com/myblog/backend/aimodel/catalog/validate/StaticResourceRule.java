package com.myblog.backend.aimodel.catalog.validate;

import java.util.regex.Pattern;

/**
 * 静态资源页识别规则 (CODE_REVIEW 追加 17/38/39 强化止血)
 * 条款 / 招聘 / 隐私 / 导航 / 控制台 / 产品功能页 / 价格页 / 帮助中心等页面不属于"最新发布动态",
 * 入库时标记 is_static_resource=1, 公开动态流一律排除。
 * SQL_REGEXP 与 isStaticResource 使用同一套特征, 供迁移回填与实时入库共用。
 */
public final class StaticResourceRule {

    /**
     * MySQL REGEXP 用特征串 (ICU, 对 ci 排序规则默认不区分大小写)
     * 追加 39 增强: 阻断产品功能首页、控制台、通用解决方案、价格页、安全合规等导航类静态链接
     */
    public static final String SQL_REGEXP =
            "(terms[-_ ]?of|/terms|privacy|cookie|/careers|careers\\.|/about|about-us|about\\.html|"
                    + "press-kit|press kit|/support|help[-_ ]?center|help center|discord|/contact|"
                    + "contact[-_ ]?sales|contact sales|/jobs|/legal|/brand|招聘|服务条款|隐私政策|加入我们|品牌规范|文档中心|"
                    + "guidelines|[-_/]brand|/membership|/academy|/resources/|/products|/community|"
                    + "/features|/solutions|/pricing|/console|/dashboard|/app$|/chat$|/security|/compliance|"
                    + "\\?from=|/en$|blog/?$|/bot$|/business$|//[^/]+/?$|备案|beian|icp[-)\" ]?|"
                    + "developers\\.openai\\.com/api/docs/changelog$)";

    private static final Pattern JAVA_PATTERN = Pattern.compile(SQL_REGEXP, Pattern.CASE_INSENSITIVE);

    private StaticResourceRule() {}

    public static boolean isStaticResource(String title, String url) {
        String text = ((title == null ? "" : title) + " " + (url == null ? "" : url)).toLowerCase();
        if (text.isBlank()) {
            return false;
        }
        return JAVA_PATTERN.matcher(text).find();
    }
}
