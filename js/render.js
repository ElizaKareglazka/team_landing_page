/* ═══════════════════════════════════════════
   render.js — Render All Sections from Data
   ═══════════════════════════════════════════ */

/**
 * Render the entire site from data object
 */
function renderSite(data) {
  renderHero(data.meta, data.contacts);
  renderDirections(data.directions);
  renderTechStack(data.techStack);
  renderTeam(data.team);
  renderProjects(data.projects);
  renderRoadmap(data.roadmap);
  renderProcess(data.process);
  renderFaq(data.faq);
  renderFooter(data.contacts);
}

/**
 * Hero section
 */
function renderHero(meta, contacts) {
  document.getElementById('heroTag').textContent = meta.tagline;
  document.getElementById('heroHeadline').innerHTML = meta.headline;
  document.getElementById('heroSubtitle').textContent = meta.subtitle;

  document.getElementById('heroMetrics').innerHTML = meta.metrics
    .map(m => `
      <div class="metric">
        <span class="metric-val">${m.value}</span>
        <span class="metric-label">${m.label}</span>
      </div>
    `)
    .join('');

  document.getElementById('heroCta').innerHTML = `
    <a href="mailto:${contacts.email}" class="btn-primary">
      Связаться с нами ${icons.arrow}
    </a>
    <a href="#projects" class="btn-ghost">Смотреть проекты</a>
  `;
}

/**
 * Directions (About) section
 */
function renderDirections(directions) {
  const grid = document.getElementById('aboutGrid');
  grid.innerHTML = directions
    .map((d, i) => `
      <div class="about-card reveal reveal-delay-${(i % 3) + 1}">
        <h3>${d.title}</h3>
        <p>${d.desc}</p>
      </div>
    `)
    .join('');
}

/**
 * Tech stack scrolling marquee
 */
function renderTechStack(stack) {
  const track = document.getElementById('techTrack');
  const items = stack
    .map(t => `<div class="tech-item"><span class="tech-dot"></span>${t}</div>`)
    .join('');
  // Duplicate for seamless loop
  track.innerHTML = items + items;
}

/**
 * Team cards
 */
function renderTeam(team) {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = '';

  team.forEach((member, i) => {
    const card = document.createElement('div');
    card.className = `team-card reveal reveal-delay-${(i % 3) + 1}`;
    card.addEventListener('click', () => openTeamModal(member));

    const photoDiv = document.createElement('div');
    photoDiv.className = 'team-card-photo';
    photoDiv.appendChild(createPhotoElement(member.photo, member.name));

    card.innerHTML = `
      <div class="team-card-name">${member.name}</div>
      <div class="team-card-role">${member.role}</div>
      <div class="team-card-hint">Подробнее →</div>
    `;
    card.prepend(photoDiv);
    grid.appendChild(card);
  });
}

/**
 * Projects cards — click opens modal
 */
function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';

  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = `project-card reveal reveal-delay-${(i % 3) + 1}`;
    card.addEventListener('click', () => openProjectModal(p));

    // Build cover content
    let coverContent;
    if (p.cover && p.cover.trim() !== '') {
      coverContent = `<img src="${p.cover}" alt="${p.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; this.parentElement.querySelector('.project-cover-label').style.display='flex';">
        <div class="project-cover-pattern" style="display:none">${coverPatterns[p.pattern] || coverPatterns.default}</div>`;
    } else {
      coverContent = `<div class="project-cover-pattern">${coverPatterns[p.pattern] || coverPatterns.default}</div>`;
    }

    card.innerHTML = `
      <div class="project-cover">
        ${coverContent}
      </div>
      <div class="project-body">
        <div class="project-tag">${p.tag}</div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="project-stack">
          ${p.stack.map(s => `<span class="project-stack-tag">${s}</span>`).join('')}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/**
 * Process timeline
 */
function renderProcess(process) {
  const timeline = document.getElementById('processTimeline');
  timeline.innerHTML = process
    .map((step, i) => `
      <div class="process-step">
        <div class="process-step-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="process-step-line"></div>
        <h3>${step.title}</h3>
        <p>${step.desc}</p>
      </div>
    `)
    .join('');
}

/**
 * FAQ accordion
 */
function renderFaq(faq) {
  const list = document.getElementById('faqList');
  list.innerHTML = '';

  faq.forEach(f => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
      <div class="faq-q">
        <span>${f.q}</span>
        <span class="faq-q-icon">+</span>
      </div>
      <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
    `;

    item.querySelector('.faq-q').addEventListener('click', () => {
      const wasActive = item.classList.contains('active');

      // Close all
      list.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-a').style.maxHeight = '0';
      });

      // Open clicked if it wasn't active
      if (!wasActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-a');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    list.appendChild(item);
  });
}

/**
 * Footer
 */
function renderFooter(contacts) {
  document.getElementById('footerContent').innerHTML = `
    <div class="footer-left">
      <div class="footer-brand">X5 Tech</div>
      <div class="footer-copy">© ${new Date().getFullYear()} Команда разработки</div>
    </div>
    <div class="footer-links">
      <a href="mailto:${contacts.email}" class="footer-link">
        ${icons.email} ${contacts.email}
      </a>
      <a href="${contacts.telegram}" class="footer-link" target="_blank">
        ${icons.telegram} Telegram
      </a>
    </div>
  `;
}
