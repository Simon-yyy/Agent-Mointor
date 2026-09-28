# 强制终端控制台使用 UTF-8 代码页与输出编码，彻底根除 Windows 控制台乱码
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [VERIFY] 启动 AI 模型观测台信源可靠性与防再污染自动化校验..." -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$allPassed = $true

function Check-Assert {
    param(
        [string]$Name,
        [bool]$Success,
        [string]$Err
    )
    if ($Success) {
        Write-Host " [PASS] $Name" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $Name - $Err" -ForegroundColor Red
        $script:allPassed = $false
    }
}

# 1. 验证活跃信源与收录事件总量基线
$statusRes = Invoke-RestMethod -Uri "$baseUrl/api/model-updates/status" -Method Get
Check-Assert "活跃信源数严格核准为 24 条" ($statusRes.data.activeSources -eq 24) "实际为 $($statusRes.data.activeSources)"
Check-Assert "已核准大模型事件总数严格保持 53 条基线" ($statusRes.data.totalEvents -eq 53) "实际为 $($statusRes.data.totalEvents)"

# 2. 验证 OpenAI 9月22日与9月25日事件及对应物证链
$timelineRes = Invoke-RestMethod -Uri "$baseUrl/api/model-updates/timeline" -Method Get
$sep25 = $timelineRes.data | Where-Object { $_.releaseDate -like "*2026-09-25*" -and $_.vendorName -eq "OpenAI" }
$sep22 = $timelineRes.data | Where-Object { $_.releaseDate -like "*2026-09-22*" -and $_.vendorName -eq "OpenAI" }
Check-Assert "OpenAI 9月25日图像编码修复事件存在且挂载权威佐证" ($null -ne $sep25 -and ($sep25 | Where-Object { $_.evidences.Count -gt 0 }).Count -gt 0) "缺少 9月25日 事件或物证"
Check-Assert "OpenAI 9月22日新模型发布事件存在且挂载权威佐证" ($null -ne $sep22 -and ($sep22 | Where-Object { $_.evidences.Count -gt 0 }).Count -gt 0) "缺少 9月22日 事件或物证"

# 3. 验证三方滚动别名已彻底拦截（防污染）
$modelsRes = Invoke-RestMethod -Uri "$baseUrl/api/model-updates/models?size=200" -Method Get
$aliases = $modelsRes.data.list | Where-Object { $_.modelKey -match ".*-latest$" }
Check-Assert "模型目录中三方滚动别名 (*-latest) 数量严格为 0" ($aliases.Count -eq 0) "检测到 $($aliases.Count) 个别名残留"

# 4. 验证官方动态流置顶项为真实修复动态
$updatesRes = Invoke-RestMethod -Uri "$baseUrl/api/model-updates/official-updates?size=20" -Method Get
$topItem = $updatesRes.data.list[0]
$isTopSep25 = ($topItem.title -like "*Fix for image encoding*" -or $topItem.publishedAt -eq "2026-09-25")
Check-Assert "官方动态流首条动态为 9月25日 图像编码修复更新" $isTopSep25 "首条动态: $($topItem.title)"

# 5. 验证官方动态流门禁（严禁空发布日期与导航链接入流）
$nullDates = $updatesRes.data.list | Where-Object { [string]::IsNullOrWhiteSpace($_.publishedAt) }
Check-Assert "官方动态流公开条目发布日期为空的数量严格为 0" ($nullDates.Count -eq 0) "发现 $($nullDates.Count) 条空日期链接"

# 6. 验证覆盖矩阵呈现标准语义状态
$covRes = Invoke-RestMethod -Uri "$baseUrl/api/model-updates/coverage?year=2026" -Method Get
$hasCovered = ($covRes.data | Where-Object { $_.status -eq "VERIFIED_COVERED" }).Count -gt 0
$hasEmpty = ($covRes.data | Where-Object { $_.status -eq "VERIFIED_EMPTY" }).Count -gt 0
Check-Assert "信源覆盖矩阵包含 VERIFIED_COVERED 与 VERIFIED_EMPTY 标准语义" ($hasCovered -and $hasEmpty) "缺少标准覆盖状态"

# 7. 验证官方动态流按厂商分类筛选正交隔离
$vendorUrl = $baseUrl + "/api/model-updates/official-updates?vendorId=1" + [char]38 + "size=5"
$openAiUpdates = Invoke-RestMethod -Uri $vendorUrl -Method Get
$onlyOpenAi = ($openAiUpdates.data.list | Where-Object { $_.vendorId -ne 1 }).Count -eq 0
Check-Assert "厂商筛选 vendorId=1 仅返回该厂商动态且结果非空" ($onlyOpenAi -and $openAiUpdates.data.total -gt 0) "厂商筛选不匹配"

# 8. 验证信源内容健康度与防再污染机制生效
Check-Assert "信源内容健康度双轨统计正常且异常源为 0" ($statusRes.data.contentHealthySources -gt 0 -and $statusRes.data.abnormalSources -eq 0) "健康度统计异常"

$sw.Stop()
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host " [ALL PASS] 全部 10 项信源可靠性与防再污染校验均通过！耗时: $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
    exit 0
} else {
    Write-Host " [FAIL] 校验存在未通过项！耗时: $($sw.ElapsedMilliseconds)ms" -ForegroundColor Red
    exit 1
}
