/* ═══════════════════════════════════════════
   roadmap.js — Gantt Chart Rendering
   ═══════════════════════════════════════════ */

/**
 * Render the Gantt chart from roadmap data
 */
function renderRoadmap(roadmapData) {
  const container = document.getElementById('ganttContainer');
  if (!roadmapData || roadmapData.length === 0) {
    container.innerHTML = '<p style="color:var(--text3);font-size:14px;">Roadmap пока пуст.</p>';
    return;
  }

  // Calculate date range
  const allDates = roadmapData.flatMap(r => [r.start, r.end]);
  const minDate = allDates.reduce((a, b) => (a < b ? a : b));
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b));

  // Expand range by 1 month on each side
  let startDate = parseMonth(minDate);
  startDate.setMonth(startDate.getMonth() - 1);
  let endDate = parseMonth(maxDate);
  endDate.setMonth(endDate.getMonth() + 1);

  // Generate months array
  const months = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    months.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const totalMonths = months.length;

  // Today's position
  const today = new Date();
  const todayFraction = getMonthFraction(today, months, startDate, endDate);

  // Build HTML
  let html = '<div class="gantt-chart">';

  // Month headers
  html += '<div class="gantt-header">';
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  months.forEach(m => {
    const isCurrent = m.key === todayKey;
    html += `<div class="gantt-month${isCurrent ? ' current' : ''}">${monthNames[m.month]} ${String(m.year).slice(2)}</div>`;
  });
  html += '</div>';

  // Body with rows
  html += '<div class="gantt-body" style="position:relative">';

  // Grid lines
  months.forEach((m, i) => {
    const frac = i / totalMonths;
    html += `<div class="gantt-grid-line" style="left:calc(var(--label-w) + (100% - var(--label-w)) * ${frac})"></div>`;
  });

  // Rows
  roadmapData.forEach(item => {
    const barLeft = getBarPosition(item.start, months, totalMonths);
    const barRight = getBarPosition(item.end, months, totalMonths);
    const barWidth = barRight - barLeft;

    const statusLabel = item.status === 'in_progress' ? 'В работе'
      : item.status === 'done' ? 'Завершён' : 'Планируется';

    html += `
      <div class="gantt-row">
        <div class="gantt-row-label">${item.name}</div>
        <div class="gantt-row-track">
          <div class="gantt-bar ${item.status}"
               style="left:${barLeft}%;width:${Math.max(barWidth, 2)}%"
               data-name="${item.name}"
               data-start="${formatMonth(item.start)}"
               data-end="${formatMonth(item.end)}"
               data-status="${statusLabel}"
               data-owner="${item.owner || ''}"
               data-desc="${item.description || ''}"
               onmouseenter="showGanttTooltip(event, this)"
               onmousemove="moveGanttTooltip(event)"
               onmouseleave="hideGanttTooltip()">
          </div>
        </div>
      </div>
    `;
  });

  // Today line
  if (todayFraction !== null) {
    const frac = todayFraction / 100;
    html += `<div class="gantt-today" style="left:calc(var(--label-w) + (100% - var(--label-w)) * ${frac})"></div>`;
  }

  html += '</div>'; // gantt-body
  html += '</div>'; // gantt-chart

  container.innerHTML = html;
}

/**
 * Calculate bar position as percentage of the track width
 */
function getBarPosition(dateStr, months, totalMonths) {
  const [year, month] = dateStr.split('-').map(Number);
  const idx = months.findIndex(m => m.year === year && m.month === month - 1);
  if (idx === -1) return 0;
  return (idx / totalMonths) * 100;
}

/**
 * Calculate today's fractional position
 */
function getMonthFraction(date, months, startDate, endDate) {
  if (date < startDate || date > endDate) return null;

  const totalMs = endDate.getTime() - startDate.getTime();
  const currentMs = date.getTime() - startDate.getTime();
  return (currentMs / totalMs) * 100;
}

/**
 * Tooltip handlers
 */
const tooltip = document.getElementById('ganttTooltip');

function showGanttTooltip(event, el) {
  document.getElementById('tooltipName').textContent = el.dataset.name;
  document.getElementById('tooltipMeta').innerHTML =
    `<span>${el.dataset.start} → ${el.dataset.end}</span><span>${el.dataset.status}</span>`;
  document.getElementById('tooltipDesc').textContent = el.dataset.desc;
  document.getElementById('tooltipOwner').textContent = el.dataset.owner
    ? `→ ${el.dataset.owner}` : '';

  tooltip.classList.add('visible');
  moveGanttTooltip(event);
}

function moveGanttTooltip(event) {
  const x = event.clientX + 16;
  const y = event.clientY - 10;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

function hideGanttTooltip() {
  tooltip.classList.remove('visible');
}
