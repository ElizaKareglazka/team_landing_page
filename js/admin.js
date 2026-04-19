/* ═══════════════════════════════════════════
   admin.js — Admin Mode (v1.1)
   ═══════════════════════════════════════════ */

const ADMIN_HASH = '665532ac0caea9cec0605f1162b622bedd3a64f593fa43e6e2a493ddfc1da173';

/* ─── Init ─── */
function initAdmin() {
  // Restore session
  if (sessionStorage.getItem('admin') === 'true') {
    activateAdmin();
  }

  // URL param trigger
  if (new URLSearchParams(window.location.search).get('admin') === '1') {
    if (sessionStorage.getItem('admin') !== 'true') showPasswordModal();
  }

  // Triple-click logo trigger
  let clicks = 0, timer = null;
  document.getElementById('logo').addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    if (clicks >= 3) { clicks = 0; showPasswordModal(); }
    timer = setTimeout(() => clicks = 0, 600);
  });
}

/* ─── SHA-256 verify ─── */
async function verifyPassword(input) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === ADMIN_HASH;
}

/* ─── Password Modal ─── */
function showPasswordModal() {
  if (document.getElementById('adminPasswordOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'adminPasswordOverlay';
  overlay.className = 'admin-overlay';
  overlay.innerHTML = `
    <div class="admin-modal admin-modal-sm">
      <div class="admin-modal-title">Вход в режим администратора</div>
      <div class="admin-field">
        <label>Пароль</label>
        <input type="password" id="adminPassInput" placeholder="Введите пароль" autocomplete="off">
      </div>
      <div class="admin-error" id="adminPassError"></div>
      <div class="admin-form-actions">
        <button class="admin-btn-cancel" id="adminPassCancel">Отмена</button>
        <button class="admin-btn-save" id="adminPassSubmit">Войти</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  const input = document.getElementById('adminPassInput');
  const error = document.getElementById('adminPassError');
  input.focus();

  const submit = async () => {
    if (await verifyPassword(input.value)) {
      overlay.remove();
      activateAdmin();
    } else {
      error.textContent = 'Неверный пароль';
      input.value = '';
      input.focus();
    }
  };

  document.getElementById('adminPassSubmit').addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  document.getElementById('adminPassCancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

/* ─── Activate / Deactivate ─── */
function activateAdmin() {
  sessionStorage.setItem('admin', 'true');
  document.body.classList.add('admin-mode');
  renderAdminToolbar();
  renderAdminControls();
}

function deactivateAdmin() {
  sessionStorage.removeItem('admin');
  document.body.classList.remove('admin-mode');
  document.getElementById('adminToolbar')?.remove();
  document.querySelectorAll('.admin-btn, .admin-card-actions').forEach(el => el.remove());
  const url = new URL(window.location);
  url.searchParams.delete('admin');
  window.history.replaceState({}, '', url);
}

/* ─── Toolbar ─── */
function renderAdminToolbar() {
  if (document.getElementById('adminToolbar')) return;

  const bar = document.createElement('div');
  bar.id = 'adminToolbar';
  bar.className = 'admin-toolbar';
  bar.innerHTML = `
    <div class="admin-toolbar-badge">⚙ Режим администратора</div>
    <div class="admin-toolbar-actions">
      <button onclick="exportData()">↓ Скачать data.json</button>
      <label class="admin-toolbar-import">
        ↑ Импортировать
        <input type="file" accept=".json" onchange="importData(event)" hidden>
      </label>
      <button onclick="deactivateAdmin()">Выйти</button>
    </div>
  `;
  document.body.prepend(bar);
}

/* ─── Export / Import ─── */
function exportData() {
  const blob = new Blob([JSON.stringify(window.siteData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      window.siteData = data;
      refreshSite();
    } catch {
      alert('Ошибка: невалидный JSON-файл.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

/* ─── Re-render site + admin controls ─── */
function refreshSite() {
  renderSite(window.siteData);
  requestAnimationFrame(() => {
    initScrollReveal();
    if (sessionStorage.getItem('admin') === 'true') {
      renderAdminControls();
    }
  });
}

/* ─── Admin Controls on Sections ──��� */
function renderAdminControls() {
  // Remove old controls first
  document.querySelectorAll('.admin-btn, .admin-card-actions').forEach(el => el.remove());

  // ── Hero: edit meta ──
  const hero = document.getElementById('hero');
  hero.appendChild(makeAdminBtn('Редактировать', () => showMetaForm()));

  // ── Team: add + edit/delete per card ──
  const teamGrid = document.getElementById('teamGrid');
  teamGrid.appendChild(makeAdminBtn('+ Добавить сотрудника', () => showTeamForm(null, -1)));
  teamGrid.querySelectorAll('.team-card').forEach((card, i) => {
    card.appendChild(makeCardActions(
      () => showTeamForm(window.siteData.team[i], i),
      () => { if (confirm('Удалить сотрудника?')) { window.siteData.team.splice(i, 1); refreshSite(); } }
    ));
  });

  // ── Projects: add + edit/delete per card ──
  const projGrid = document.getElementById('projectsGrid');
  projGrid.appendChild(makeAdminBtn('+ Добавить проект', () => showProjectForm(null, -1)));
  projGrid.querySelectorAll('.project-card').forEach((card, i) => {
    card.appendChild(makeCardActions(
      () => showProjectForm(window.siteData.projects[i], i),
      () => { if (confirm('Удалить проект?')) { window.siteData.projects.splice(i, 1); refreshSite(); } }
    ));
  });

  // ── Roadmap: add + edit/delete per row ──
  const roadmapSection = document.getElementById('roadmap');
  roadmapSection.appendChild(makeAdminBtn('+ Добавить в roadmap', () => showRoadmapForm(null, -1)));
  document.querySelectorAll('.gantt-row').forEach((row, i) => {
    row.appendChild(makeCardActions(
      () => showRoadmapForm(window.siteData.roadmap[i], i),
      () => { if (confirm('Удалить из roadmap?')) { window.siteData.roadmap.splice(i, 1); refreshSite(); } }
    ));
  });

  // ── Tech Stack: edit list ──
  const stackSection = document.getElementById('stack');
  stackSection.appendChild(makeAdminBtn('Редактировать стек', () => showTechStackForm()));

  // ── FAQ: add + edit/delete per item ──
  const faqList = document.getElementById('faqList');
  faqList.appendChild(makeAdminBtn('+ Добавить вопрос', () => showFaqForm(null, -1)));
  faqList.querySelectorAll('.faq-item').forEach((item, i) => {
    item.appendChild(makeCardActions(
      () => showFaqForm(window.siteData.faq[i], i),
      () => { if (confirm('Удалить вопрос?')) { window.siteData.faq.splice(i, 1); refreshSite(); } }
    ));
  });
}

/* ─── Helper: admin button ─── */
function makeAdminBtn(text, onClick) {
  const btn = document.createElement('button');
  btn.className = 'admin-btn';
  btn.textContent = text;
  btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return btn;
}

/* ─── Helper: card edit/delete actions ─── */
function makeCardActions(onEdit, onDelete) {
  const wrap = document.createElement('div');
  wrap.className = 'admin-card-actions';
  const editBtn = document.createElement('button');
  editBtn.textContent = '✎';
  editBtn.title = 'Редактировать';
  editBtn.addEventListener('click', (e) => { e.stopPropagation(); onEdit(); });
  const delBtn = document.createElement('button');
  delBtn.textContent = '✕';
  delBtn.title = 'Удалить';
  delBtn.className = 'delete';
  delBtn.addEventListener('click', (e) => { e.stopPropagation(); onDelete(); });
  wrap.appendChild(editBtn);
  wrap.appendChild(delBtn);
  return wrap;
}

/* ─── Generic Form Modal ─── */
function showFormModal(title, fields, values, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  const fieldRows = fields.map(f => {
    const val = values[f.key] ?? '';
    if (f.type === 'textarea') {
      return `<div class="admin-field"><label>${f.label}</label><textarea data-key="${f.key}" placeholder="${f.placeholder || ''}">${val}</textarea></div>`;
    }
    if (f.type === 'select') {
      const opts = f.options.map(o => `<option value="${o.value}"${o.value === val ? ' selected' : ''}>${o.label}</option>`).join('');
      return `<div class="admin-field"><label>${f.label}</label><select data-key="${f.key}">${opts}</select></div>`;
    }
    return `<div class="admin-field"><label>${f.label}</label><input type="${f.type || 'text'}" data-key="${f.key}" value="${val}" placeholder="${f.placeholder || ''}"></div>`;
  }).join('');

  overlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-title">${title}</div>
      <div class="admin-form">${fieldRows}</div>
      <div class="admin-form-actions">
        <button class="admin-btn-cancel">Отмена</button>
        <button class="admin-btn-save">Сохранить</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  const close = () => overlay.remove();
  overlay.querySelector('.admin-btn-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  overlay.querySelector('.admin-btn-save').addEventListener('click', () => {
    const result = {};
    overlay.querySelectorAll('[data-key]').forEach(el => {
      result[el.dataset.key] = el.value;
    });
    onSave(result);
    close();
  });
}

/* ─── Meta / Hero Form ─── */
function showMetaForm() {
  const m = window.siteData.meta;
  const c = window.siteData.contacts;
  showFormModal('Редактирование — Hero', [
    { key: 'tagline', label: 'Тег-метка', placeholder: 'Команда разработки' },
    { key: 'headline', label: 'Заголовок (HTML)', placeholder: 'Заголовок с <em>акцентом</em>' },
    { key: 'subtitle', label: 'Подзаголовок', type: 'textarea' },
    { key: 'mVal0', label: 'Метрика 1 — значение' },
    { key: 'mLbl0', label: 'Метрика 1 — подпись' },
    { key: 'mVal1', label: 'Метрика 2 — значение' },
    { key: 'mLbl1', label: 'Метрика 2 — подпись' },
    { key: 'mVal2', label: 'Метрика 3 — значение' },
    { key: 'mLbl2', label: 'Метрика 3 — подпись' },
    { key: 'email', label: 'Email' },
    { key: 'telegram', label: 'Telegram (ссылка)' },
  ], {
    tagline: m.tagline,
    headline: m.headline,
    subtitle: m.subtitle,
    mVal0: m.metrics[0]?.value || '', mLbl0: m.metrics[0]?.label || '',
    mVal1: m.metrics[1]?.value || '', mLbl1: m.metrics[1]?.label || '',
    mVal2: m.metrics[2]?.value || '', mLbl2: m.metrics[2]?.label || '',
    email: c.email,
    telegram: c.telegram,
  }, (r) => {
    m.tagline = r.tagline;
    m.headline = r.headline;
    m.subtitle = r.subtitle;
    m.metrics = [
      { value: r.mVal0, label: r.mLbl0 },
      { value: r.mVal1, label: r.mLbl1 },
      { value: r.mVal2, label: r.mLbl2 },
    ];
    c.email = r.email;
    c.telegram = r.telegram;
    refreshSite();
  });
}

/* ─── Team CRUD ─── */
function showTeamForm(member, index) {
  const isNew = index === -1;
  const v = member || { name: '', role: '', photo: '', bio: '', skills: [], contacts: [{ type: 'email', value: '' }, { type: 'telegram', value: '' }] };
  showFormModal(isNew ? 'Добавить сотрудника' : 'Редактировать сотрудника', [
    { key: 'name', label: 'Имя' },
    { key: 'role', label: 'Роль' },
    { key: 'photo', label: 'Путь к фото', placeholder: 'assets/photos/name.jpg или URL' },
    { key: 'bio', label: 'Описание', type: 'textarea' },
    { key: 'skills', label: 'Навыки', placeholder: 'Go, React, Docker (через запятую)' },
    { key: 'email', label: 'Email' },
    { key: 'telegram', label: 'Telegram', placeholder: '@username' },
  ], {
    name: v.name,
    role: v.role,
    photo: v.photo,
    bio: v.bio,
    skills: v.skills.join(', '),
    email: v.contacts.find(c => c.type === 'email')?.value || '',
    telegram: v.contacts.find(c => c.type === 'telegram')?.value || '',
  }, (r) => {
    const obj = {
      name: r.name,
      role: r.role,
      photo: r.photo,
      bio: r.bio,
      skills: r.skills.split(',').map(s => s.trim()).filter(Boolean),
      contacts: [
        { type: 'email', value: r.email },
        { type: 'telegram', value: r.telegram },
      ],
    };
    if (isNew) window.siteData.team.push(obj);
    else window.siteData.team[index] = obj;
    refreshSite();
  });
}

/* ─── Projects CRUD ─── */
function buildSubprojectHTML(sp) {
  return `
    <div class="admin-subproject-item">
      <div class="admin-subproject-header">
        <span class="admin-subproject-label">Подпроект</span>
        <button type="button" class="admin-sub-remove" title="Удалить подпроект">✕</button>
      </div>
      <div class="admin-field"><label>Название</label><input type="text" data-sub="title" value="${(sp.title || '').replace(/"/g, '&quot;')}"></div>
      <div class="admin-field"><label>Описание</label><textarea data-sub="desc">${sp.desc || ''}</textarea></div>
      <div class="admin-field"><label>Задача</label><textarea data-sub="task">${sp.task || ''}</textarea></div>
      <div class="admin-field"><label>Результат</label><textarea data-sub="result">${sp.result || ''}</textarea></div>
    </div>
  `;
}

function showProjectForm(project, index) {
  const isNew = index === -1;
  const v = project || { tag: '', title: '', desc: '', cover: '', stack: [], task: '', result: '', pattern: '', subprojects: [] };
  const subs = v.subprojects || [];

  const overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  overlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-title">${isNew ? 'Добавить проект' : 'Редактировать проект'}</div>
      <div class="admin-form">
        <div class="admin-field"><label>Категория / тег</label><input type="text" data-key="tag" value="${(v.tag || '').replace(/"/g, '&quot;')}" placeholder="API, Портал, Логистика..."></div>
        <div class="admin-field"><label>Название</label><input type="text" data-key="title" value="${(v.title || '').replace(/"/g, '&quot;')}"></div>
        <div class="admin-field"><label>Краткое описание</label><textarea data-key="desc">${v.desc || ''}</textarea></div>
        <div class="admin-field"><label>Путь к обложке</label><input type="text" data-key="cover" value="${(v.cover || '').replace(/"/g, '&quot;')}" placeholder="assets/projects/name.png (необязательно)"></div>
        <div class="admin-field"><label>Стек технологий</label><input type="text" data-key="stack" value="${v.stack.join(', ')}" placeholder="Go, React, Redis (через запятую)"></div>
        <div class="admin-field"><label>Задача</label><textarea data-key="task">${v.task || ''}</textarea></div>
        <div class="admin-field"><label>Результат</label><textarea data-key="result">${v.result || ''}</textarea></div>
        <div class="admin-field"><label>SVG-паттерн</label><input type="text" data-key="pattern" value="${(v.pattern || '').replace(/"/g, '&quot;')}" placeholder="portal, api, logistics, bi, cicd, integration"></div>
        <div class="admin-subprojects-section">
          <div class="admin-subprojects-title">Подпроекты</div>
          <div id="adminSubprojectsList">${subs.map(sp => buildSubprojectHTML(sp)).join('')}</div>
          <button type="button" class="admin-btn-add-sub" id="adminAddSubproject">+ Добавить подпроект</button>
        </div>
      </div>
      <div class="admin-form-actions">
        <button class="admin-btn-cancel">Отмена</button>
        <button class="admin-btn-save">Сохранить</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  // Remove handlers for existing subprojects
  overlay.querySelectorAll('.admin-sub-remove').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.admin-subproject-item').remove());
  });

  // Add subproject
  document.getElementById('adminAddSubproject').addEventListener('click', () => {
    const list = document.getElementById('adminSubprojectsList');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildSubprojectHTML({ title: '', desc: '', task: '', result: '' });
    const item = wrapper.firstElementChild;
    list.appendChild(item);
    item.querySelector('.admin-sub-remove').addEventListener('click', () => item.remove());
    item.querySelector('input').focus();
  });

  // Close
  const close = () => overlay.remove();
  overlay.querySelector('.admin-btn-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  // Save
  overlay.querySelector('.admin-btn-save').addEventListener('click', () => {
    const obj = {
      tag: overlay.querySelector('[data-key="tag"]').value,
      title: overlay.querySelector('[data-key="title"]').value,
      desc: overlay.querySelector('[data-key="desc"]').value,
      cover: overlay.querySelector('[data-key="cover"]').value,
      stack: overlay.querySelector('[data-key="stack"]').value.split(',').map(s => s.trim()).filter(Boolean),
      task: overlay.querySelector('[data-key="task"]').value,
      result: overlay.querySelector('[data-key="result"]').value,
      pattern: overlay.querySelector('[data-key="pattern"]').value,
    };

    const subItems = overlay.querySelectorAll('.admin-subproject-item');
    if (subItems.length > 0) {
      obj.subprojects = Array.from(subItems).map(item => ({
        title: item.querySelector('[data-sub="title"]').value,
        desc: item.querySelector('[data-sub="desc"]').value,
        task: item.querySelector('[data-sub="task"]').value,
        result: item.querySelector('[data-sub="result"]').value,
      }));
    }

    if (isNew) window.siteData.projects.push(obj);
    else window.siteData.projects[index] = obj;
    refreshSite();
    close();
  });
}

/* ─── Roadmap CRUD ─── */
function showRoadmapForm(item, index) {
  const isNew = index === -1;
  const v = item || { name: '', start: '', end: '', status: 'planned', owner: '', description: '' };
  const teamNames = window.siteData.team.map(t => ({ value: t.name, label: t.name }));
  teamNames.unshift({ value: '', label: '— выберите —' });

  showFormModal(isNew ? 'Добавить в roadmap' : 'Редактировать roadmap', [
    { key: 'name', label: 'Название проекта' },
    { key: 'start', label: 'Дата начала', placeholder: 'YYYY-MM' },
    { key: 'end', label: 'Дата окончания', placeholder: 'YYYY-MM' },
    { key: 'status', label: 'Статус', type: 'select', options: [
      { value: 'planned', label: 'Запланирован' },
      { value: 'in_progress', label: 'В работе' },
      { value: 'done', label: 'Завершён' },
    ]},
    { key: 'owner', label: 'Ответственный', type: 'select', options: teamNames },
    { key: 'description', label: 'Описание', type: 'textarea' },
  ], {
    name: v.name, start: v.start, end: v.end,
    status: v.status, owner: v.owner, description: v.description,
  }, (r) => {
    const obj = { name: r.name, start: r.start, end: r.end, status: r.status, owner: r.owner, description: r.description };
    if (isNew) window.siteData.roadmap.push(obj);
    else window.siteData.roadmap[index] = obj;
    refreshSite();
  });
}

/* ─── FAQ CRUD ─── */
function showFaqForm(item, index) {
  const isNew = index === -1;
  const v = item || { q: '', a: '' };
  showFormModal(isNew ? 'Добавить вопрос' : 'Редактировать вопрос', [
    { key: 'q', label: 'Вопрос' },
    { key: 'a', label: 'Ответ', type: 'textarea' },
  ], { q: v.q, a: v.a }, (r) => {
    const obj = { q: r.q, a: r.a };
    if (isNew) window.siteData.faq.push(obj);
    else window.siteData.faq[index] = obj;
    refreshSite();
  });
}

/* ─── Tech Stack CRUD ─── */
function showTechStackForm() {
  showFormModal('Редактирование стека технологий', [
    {
      key: 'stack',
      label: 'Технологии (через запятую)',
      type: 'textarea',
      placeholder: 'Python, FastAPI, Docker, LLM, ...'
    }
  ], {
    stack: window.siteData.techStack.join(', ')
  }, (r) => {
    window.siteData.techStack = r.stack.split(',').map(s => s.trim()).filter(Boolean);
    refreshSite();
  });
}
