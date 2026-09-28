/**
 * 轻量纯原生 Markdown 解析与渲染器（增强版）
 * 零第三方外部依赖，纯原生 ESM，支持 Mac 拟物代码窗体与目录大纲提取
 */

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 提取 Markdown 正文中的标题大纲目录
 * @param {string} md
 * @returns {Array<{ id: string, text: string, level: number }>}
 */
export function extractHeadings(md) {
  if (!md) return [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const headings = [];
  let inCode = false;
  let index = 0;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const match = line.match(/^(#{1,4})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_~`]/g, '');
      const id = `heading-${index++}-${cleanText.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '')}`;
      headings.push({ id, text: cleanText, level });
    }
  }
  return headings;
}

/**
 * 将 Markdown 原文转换为带样式的 HTML
 * @param {string} md 
 * @returns {string} HTML 字符串
 */
export function renderMarkdown(md) {
  if (!md) return '';

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const output = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer = [];
  let inList = false;
  let listType = null; // 'ul' | 'ol'
  let inTable = false;
  let tableHeaderParsed = false;
  let headingIndex = 0;

  const closeList = () => {
    if (inList) {
      output.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = null;
    }
  };

  const closeTable = () => {
    if (inTable) {
      output.push('</tbody></table></div>');
      inTable = false;
      tableHeaderParsed = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. 代码块处理 ```lang
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        closeList();
        closeTable();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim() || 'text';
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const codeContent = escapeHtml(codeBuffer.join('\n'));
        const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
        output.push(`
          <div class="code-block-wrapper mac-style">
            <div class="code-block-header">
              <div class="mac-window-dots">
                <span class="mac-dot red"></span>
                <span class="mac-dot yellow"></span>
                <span class="mac-dot green"></span>
              </div>
              <span class="code-lang-tag">${escapeHtml(codeLang)}</span>
              <button class="copy-code-btn" onclick="navigator.clipboard.writeText(document.getElementById('${codeId}').innerText).then(() => { this.innerText = '已复制!'; this.classList.add('copied'); setTimeout(() => { this.innerText = '复制'; this.classList.remove('copied'); }, 2000); })">复制</button>
            </div>
            <pre><code id="${codeId}" class="language-${escapeHtml(codeLang)}">${codeContent}</code></pre>
          </div>
        `);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    // 2. 空行
    if (!trimmed) {
      closeList();
      closeTable();
      continue;
    }

    // 3. 表格处理 (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      const isDivider = cells.every((c) => /^:?-+:?$/.test(c));

      if (isDivider) {
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        output.push('<div class="table-container"><table class="markdown-table"><thead><tr>');
        for (const cell of cells) {
          output.push(`<th>${formatInline(cell)}</th>`);
        }
        output.push('</tr></thead><tbody>');
      } else {
        output.push('<tr>');
        for (const cell of cells) {
          output.push(`<td>${formatInline(cell)}</td>`);
        }
        output.push('</tr>');
      }
      continue;
    } else {
      closeTable();
    }

    // 4. 标题处理 # ~ ######
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const content = headingMatch[2].trim();
      const cleanContent = content.replace(/[*_~`]/g, '');
      const id = `heading-${headingIndex++}-${cleanContent.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '')}`;
      output.push(`<h${level} id="${id}" class="heading-anchor"><span class="heading-hash">#</span> ${formatInline(content)}</h${level}>`);
      continue;
    }

    // 5. 分割线
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      closeList();
      output.push('<hr class="markdown-divider" />');
      continue;
    }

    // 6. 引用块 > quote
    if (line.startsWith('>')) {
      closeList();
      const quoteText = line.replace(/^>\s?/, '');
      output.push(`<blockquote>${formatInline(quoteText)}</blockquote>`);
      continue;
    }

    // 7. 列表处理
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (ulMatch || olMatch) {
      const isUl = Boolean(ulMatch);
      const content = isUl ? ulMatch[2] : olMatch[2];

      if (!inList || (isUl ? listType !== 'ul' : listType !== 'ol')) {
        closeList();
        inList = true;
        listType = isUl ? 'ul' : 'ol';
        output.push(isUl ? '<ul class="markdown-list">' : '<ol class="markdown-list">');
      }
      output.push(`<li>${formatInline(content)}</li>`);
      continue;
    } else {
      closeList();
    }

    // 8. 普通段落
    output.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  closeTable();

  return output.join('\n');
}

/**
 * 格式化行内 Markdown 元素
 */
function formatInline(text) {
  if (!text) return '';

  let res = escapeHtml(text);

  // 图片：![alt](url)
  res = res.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="markdown-img" src="$2" alt="$1" loading="lazy" />');

  // 链接：[text](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>');

  // 粗体：**text**
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 斜体：*text*
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 删除线：~~text~~
  res = res.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 行内代码：`code`
  res = res.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  return res;
}

/**
 * 统计字数与预计阅读时间
 * @param {string} content 
 * @returns {{ words: number, readMinutes: number }}
 */
export function calculateReadingStats(content) {
  if (!content) return { words: 0, readMinutes: 1 };
  const clean = content.replace(/```[\s\S]*?```/g, '').replace(/[#*`~>[\]()!-]/g, '');
  const chineseCount = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (clean.match(/[a-zA-Z0-9_-]+/g) || []).length;
  const totalWords = chineseCount + englishWords;
  const readMinutes = Math.max(1, Math.ceil(totalWords / 300));
  return { words: totalWords, readMinutes };
}
