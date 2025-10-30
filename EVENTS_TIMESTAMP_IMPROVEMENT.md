# Events 页面时间戳设计改进方案

**当前问题**: 使用 `type="number"` 要求用户输入 Unix 时间戳，用户体验差  
**改进目标**: 使用日期时间选择器，自动转换为时间戳  

---

## 🔍 当前设计

### HTML 表单

```html
<div class="field">
  <label>开始时间</label>
  <input id="evStart" name="start_ts" type="number" placeholder="留空=now"/>
</div>
<div class="field">
  <label>结束时间</label>
  <input id="evEnd" name="end_ts" type="number" placeholder="留空=+1天"/>
</div>
```

### JavaScript 处理

```javascript
const payload = {
  slug: formData.slug.trim(),
  title: formData.title.trim(),
  start_ts: formData.start_ts ? Number(formData.start_ts) : null,
  end_ts: formData.end_ts ? Number(formData.end_ts) : null
};
```

### 问题

1. ❌ 用户需要知道 Unix 时间戳是什么
2. ❌ 需要使用外部工具转换时间
3. ❌ 容易输入错误的时间戳
4. ❌ 没有时间验证（开始时间 < 结束时间）
5. ❌ 编辑时无法显示可读的时间

---

## ✅ 改进方案

### 方案 1: 使用 `datetime-local` 输入类型（推荐）

#### HTML 表单

```html
<div class="field">
  <label>开始时间</label>
  <input 
    id="evStart" 
    name="start_time" 
    type="datetime-local" 
    placeholder="选择开始时间"
  />
  <small style="color: var(--muted); font-size: 11px;">
    留空则使用当前时间
  </small>
</div>
<div class="field">
  <label>结束时间</label>
  <input 
    id="evEnd" 
    name="end_time" 
    type="datetime-local" 
    placeholder="选择结束时间"
  />
  <small style="color: var(--muted); font-size: 11px;">
    留空则为开始时间 + 1 天
  </small>
</div>
```

#### JavaScript 处理

```javascript
// 工具函数：将 datetime-local 值转换为 Unix 时间戳
function datetimeToTimestamp(datetimeStr) {
  if (!datetimeStr) return null;
  return Math.floor(new Date(datetimeStr).getTime() / 1000);
}

// 工具函数：将 Unix 时间戳转换为 datetime-local 值
function timestampToDatetime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  // 格式：YYYY-MM-DDTHH:mm
  return date.toISOString().slice(0, 16);
}

// 保存活动
async function handleSaveEvent() {
  if (!ensureAuth()) return;
  
  const formData = getFormData('eventForm');
  const errors = validateForm(formData, ['slug', 'title']);
  
  if (errors.length > 0) {
    toast(errors.join(', '), 'error');
    return;
  }
  
  // 转换时间为时间戳
  const startTs = datetimeToTimestamp(formData.start_time);
  const endTs = datetimeToTimestamp(formData.end_time);
  
  // 验证时间逻辑
  if (startTs && endTs && startTs >= endTs) {
    toast('结束时间必须晚于开始时间', 'error');
    return;
  }
  
  const btn = $('#btnSave');
  const originalText = btn.textContent;
  showLoading(btn);
  
  try {
    const payload = {
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      start_ts: startTs,
      end_ts: endTs
    };
    
    const result = await apiJSONmulti(['/admin/event-upsert'], {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    toast('保存成功');
    // ... 其他逻辑
    
  } catch (error) {
    console.error('保存活动失败:', error);
    toast('保存失败：' + error.message, 'error');
  } finally {
    hideLoading(btn, originalText);
  }
}

// 加载活动数据到表单（编辑时）
function loadEventToForm(event) {
  $('#evSlug').value = event.slug || '';
  $('#evTitle').value = event.name || '';
  
  // 将时间戳转换为 datetime-local 格式
  if (event.start_ts) {
    $('#evStart').value = timestampToDatetime(event.start_ts);
  }
  if (event.end_ts) {
    $('#evEnd').value = timestampToDatetime(event.end_ts);
  }
}
```

---

### 方案 2: 使用第三方日期选择器（更强大）

如果需要更好的用户体验，可以使用第三方库如 Flatpickr：

#### 引入 Flatpickr

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/zh.js"></script>
```

#### HTML 表单

```html
<div class="field">
  <label>开始时间</label>
  <input 
    id="evStart" 
    name="start_time" 
    type="text" 
    placeholder="选择开始时间"
    readonly
  />
</div>
<div class="field">
  <label>结束时间</label>
  <input 
    id="evEnd" 
    name="end_time" 
    type="text" 
    placeholder="选择结束时间"
    readonly
  />
</div>
```

#### JavaScript 初始化

```javascript
// 初始化日期选择器
document.addEventListener('DOMContentLoaded', () => {
  // 开始时间选择器
  const startPicker = flatpickr('#evStart', {
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    time_24hr: true,
    locale: 'zh',
    minDate: 'today',
    onChange: function(selectedDates, dateStr, instance) {
      // 自动设置结束时间为开始时间 + 1 天
      if (selectedDates.length > 0 && !$('#evEnd').value) {
        const endDate = new Date(selectedDates[0]);
        endDate.setDate(endDate.getDate() + 1);
        endPicker.setDate(endDate);
      }
    }
  });
  
  // 结束时间选择器
  const endPicker = flatpickr('#evEnd', {
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    time_24hr: true,
    locale: 'zh',
    minDate: 'today'
  });
});

// 转换为时间戳
function datetimeToTimestamp(datetimeStr) {
  if (!datetimeStr) return null;
  return Math.floor(new Date(datetimeStr).getTime() / 1000);
}
```

---

## 📊 对比分析

| 特性 | 当前方案 | 方案1 (datetime-local) | 方案2 (Flatpickr) |
|------|---------|----------------------|-------------------|
| 用户体验 | ❌ 差 | ✅ 好 | ✅ 优秀 |
| 浏览器兼容性 | ✅ 完美 | ⚠️ 较好 | ✅ 完美 |
| 移动端支持 | ❌ 差 | ✅ 原生支持 | ✅ 优秀 |
| 时区处理 | ❌ 无 | ✅ 自动 | ✅ 可配置 |
| 依赖 | ✅ 无 | ✅ 无 | ❌ 需要库 |
| 文件大小 | 0 KB | 0 KB | ~20 KB |
| 自定义样式 | - | ⚠️ 有限 | ✅ 完全可定制 |
| 验证 | ❌ 无 | ✅ 原生 | ✅ 强大 |

---

## 🎯 推荐方案

### 短期（快速改进）: 方案 1 - datetime-local

**优点**:
- ✅ 无需额外依赖
- ✅ 原生浏览器支持
- ✅ 移动端体验好
- ✅ 实现简单

**缺点**:
- ⚠️ 旧版浏览器支持有限（但现代浏览器都支持）
- ⚠️ 样式定制受限

### 长期（最佳体验）: 方案 2 - Flatpickr

**优点**:
- ✅ 用户体验最佳
- ✅ 功能强大（时区、语言、验证等）
- ✅ 完全可定制
- ✅ 浏览器兼容性好

**缺点**:
- ❌ 需要引入外部库
- ❌ 增加页面加载大小

---

## 🔧 完整实现代码（方案 1）

### 更新后的 events.html

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <title>活动管理 - 旗袍DAO管理后台</title>
  <link rel="stylesheet" href="/styles/app.css"/>
  <link rel="stylesheet" href="common/admin-common.css"/>
  <script src="/poap.config.js"></script>
  <style>
    /* 优化 datetime-local 输入框样式 */
    input[type="datetime-local"] {
      font-family: inherit;
      padding: 8px 12px;
    }
    
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
    }
    
    input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
    }
    
    .field small {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      color: var(--muted);
    }
  </style>
</head>
<body>
<div class="wrap">
  <!-- 导航栏 -->
  <nav class="admin-nav">
    <div class="nav-brand">活动管理</div>
    <button class="hamburger">☰</button>
    <div class="nav-user">
      <span id="authState" class="pill">未登录</span>
    </div>
  </nav>

  <!-- 移动端侧边栏 -->
  <div class="sidebar-overlay"></div>
  <div class="sidebar">
    <!-- ... 侧边栏内容 ... -->
  </div>

  <!-- 活动创建/编辑 -->
  <div class="card">
    <h2 class="card-title">活动维护</h2>
    
    <form id="eventForm">
      <div class="grid grid-2">
        <div class="field">
          <label>活动 slug *</label>
          <input id="evSlug" name="slug" placeholder="如：qipao-20251208" required/>
        </div>
        <div class="field">
          <label>标题 *</label>
          <input id="evTitle" name="title" placeholder="活动标题" required/>
        </div>
        <div class="field">
          <label>开始时间</label>
          <input 
            id="evStart" 
            name="start_time" 
            type="datetime-local" 
            placeholder="选择开始时间"
          />
          <small>留空则使用当前时间</small>
        </div>
        <div class="field">
          <label>结束时间</label>
          <input 
            id="evEnd" 
            name="end_time" 
            type="datetime-local" 
            placeholder="选择结束时间"
          />
          <small>留空则为开始时间 + 1 天</small>
        </div>
      </div>
      
      <div class="row">
        <button type="button" id="btnSave" class="btn btn-primary btn-block">
          保存 / 更新活动
        </button>
        <button type="button" id="btnGetCode" class="btn btn-secondary btn-block">
          获取固定签到码
        </button>
      </div>
    </form>
  </div>

  <!-- ... 其他内容 ... -->

</div>

<script src="common/admin-common.js"></script>
<script>
// 工具函数：将 datetime-local 值转换为 Unix 时间戳
function datetimeToTimestamp(datetimeStr) {
  if (!datetimeStr) return null;
  return Math.floor(new Date(datetimeStr).getTime() / 1000);
}

// 工具函数：将 Unix 时间戳转换为 datetime-local 值
function timestampToDatetime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  // 格式：YYYY-MM-DDTHH:mm
  return date.toISOString().slice(0, 16);
}

// 活动管理特定功能
let currentEventSlug = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 从URL参数获取活动slug
  const urlParams = new URLSearchParams(window.location.search);
  const eventSlug = urlParams.get('event') || urlParams.get('slug');
  if (eventSlug) {
    $('#evSlug').value = eventSlug;
    currentEventSlug = eventSlug;
    setQRAndLinks(eventSlug, '');
  }
  
  // 加载活动列表
  loadEvents();
  
  // 绑定所有按钮事件
  const btnRefresh = $('#btnRefreshEvents');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', loadEvents);
  }
  
  $('#btnSave')?.addEventListener('click', handleSaveEvent);
  $('#btnGetCode')?.addEventListener('click', handleGetCode);
  $('#btnExport')?.addEventListener('click', handleExport);
  
  // 开始时间变化时，自动设置结束时间
  $('#evStart')?.addEventListener('change', function() {
    const endInput = $('#evEnd');
    if (!endInput.value && this.value) {
      const startDate = new Date(this.value);
      startDate.setDate(startDate.getDate() + 1);
      endInput.value = startDate.toISOString().slice(0, 16);
    }
  });
});

// 保存活动
async function handleSaveEvent() {
  if (!ensureAuth()) return;
  
  const formData = getFormData('eventForm');
  const errors = validateForm(formData, ['slug', 'title']);
  
  if (errors.length > 0) {
    toast(errors.join(', '), 'error');
    return;
  }
  
  // 转换时间为时间戳
  const startTs = datetimeToTimestamp(formData.start_time);
  const endTs = datetimeToTimestamp(formData.end_time);
  
  // 验证时间逻辑
  if (startTs && endTs && startTs >= endTs) {
    toast('结束时间必须晚于开始时间', 'error');
    return;
  }
  
  const btn = $('#btnSave');
  const originalText = btn.textContent;
  showLoading(btn);
  
  try {
    const payload = {
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      start_ts: startTs,
      end_ts: endTs
    };
    
    const result = await apiJSONmulti(['/admin/event-upsert'], {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    toast('保存成功');
    currentEventSlug = payload.slug;
    
    if (result.static_code) {
      $('#staticCode').textContent = result.static_code;
      setQRAndLinks(payload.slug, result.static_code);
    }
    
    // 刷新活动列表
    loadEvents();
    
  } catch (error) {
    console.error('保存活动失败:', error);
    toast('保存失败：' + error.message, 'error');
  } finally {
    hideLoading(btn, originalText);
  }
}

// 加载活动数据到表单（编辑时）
function loadEventToForm(event) {
  $('#evSlug').value = event.slug || '';
  $('#evTitle').value = event.name || '';
  
  // 将时间戳转换为 datetime-local 格式
  if (event.start_ts) {
    $('#evStart').value = timestampToDatetime(event.start_ts);
  }
  if (event.end_ts) {
    $('#evEnd').value = timestampToDatetime(event.end_ts);
  }
}

// ... 其他函数保持不变 ...

// 显示活动列表（增强版）
function displayEvents(events) {
  const container = $('#eventsList');
  
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="list-item text-center">暂无活动</div>';
    return;
  }
  
  container.innerHTML = events.map(event => {
    const now = Date.now() / 1000;
    const isActive = event.start_ts && event.end_ts && 
                     now >= event.start_ts && now <= event.end_ts;
    const isPending = event.start_ts && now < event.start_ts;
    const isEnded = event.end_ts && now > event.end_ts;
    
    let statusClass = 'pill-warning';
    let statusText = '未知';
    
    if (isActive) {
      statusClass = 'pill-ok';
      statusText = '进行中';
    } else if (isPending) {
      statusClass = 'pill-info';
      statusText = '未开始';
    } else if (isEnded) {
      statusClass = 'pill-error';
      statusText = '已结束';
    }
    
    return `
      <div class="list-item">
        <div style="flex: 1;">
          <div style="font-weight: 600;">${event.name || '未命名活动'}</div>
          <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">
            Slug: ${event.slug || 'N/A'}
          </div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">
            开始: ${event.start_ts ? new Date(event.start_ts * 1000).toLocaleString('zh-CN') : '未设置'}<br>
            结束: ${event.end_ts ? new Date(event.end_ts * 1000).toLocaleString('zh-CN') : '未设置'}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
          <span class="pill ${statusClass}">${statusText}</span>
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="editEvent('${event.slug}')"
            style="font-size: 11px; padding: 4px 8px;"
          >
            编辑
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 编辑活动
async function editEvent(slug) {
  if (!ensureAuth()) return;
  
  try {
    const result = await apiJSONmulti([`/poap/event/${encodeURIComponent(slug)}`]);
    if (result.ok && result.event) {
      loadEventToForm(result.event);
      // 滚动到表单
      document.querySelector('#eventForm').scrollIntoView({ behavior: 'smooth' });
      toast('已加载活动信息，可以编辑');
    }
  } catch (error) {
    console.error('加载活动失败:', error);
    toast('加载失败：' + error.message, 'error');
  }
}
</script>
</body>
</html>
```

---

## 🧪 测试清单

### 功能测试

- [ ] ✅ 创建新活动（不填时间）
- [ ] ✅ 创建新活动（填写开始时间）
- [ ] ✅ 创建新活动（填写开始和结束时间）
- [ ] ✅ 验证：结束时间必须晚于开始时间
- [ ] ✅ 编辑已有活动，时间正确显示
- [ ] ✅ 开始时间变化时，自动设置结束时间为 +1 天
- [ ] ✅ 活动列表显示可读的时间格式
- [ ] ✅ 活动状态正确显示（未开始/进行中/已结束）

### 浏览器兼容性测试

- [ ] ✅ Chrome/Edge (完美支持)
- [ ] ✅ Firefox (完美支持)
- [ ] ✅ Safari (完美支持)
- [ ] ⚠️ IE11 (降级为 text 输入)

### 移动端测试

- [ ] ✅ iOS Safari - 原生日期选择器
- [ ] ✅ Android Chrome - 原生日期选择器
- [ ] ✅ 触摸操作流畅

---

## 📝 总结

### 当前问题

❌ 使用 `type="number"` 要求输入 Unix 时间戳  
❌ 用户体验极差  
❌ 容易出错  
❌ 无法验证  

### 改进后

✅ 使用 `type="datetime-local"` 原生日期选择器  
✅ 用户体验优秀  
✅ 自动转换时间戳  
✅ 内置验证  
✅ 移动端友好  
✅ 可读的时间显示  

### 实施建议

**立即实施**: 方案 1 (datetime-local)
- 无需额外依赖
- 实现简单
- 效果显著

**未来考虑**: 方案 2 (Flatpickr)
- 如果需要更强大的功能
- 如果需要自定义样式
- 如果需要高级验证

---

**文档生成时间**: 2025-10-28  
**当前状态**: 待实施  
**优先级**: 🔥 高（用户体验改进）

