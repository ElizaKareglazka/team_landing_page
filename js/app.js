/* ═══════════════════════════════════════════
   app.js — Application Entry Point
   ═══════════════════════════════════════════ */

/**
 * Load data.json and initialize the site
 */
(async function init() {
  try {
    const response = await fetch('data.json?t=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();

    // Store globally for admin mode access
    window.siteData = data;

    // Render all sections
    renderSite(data);

    // Initialize utilities (after DOM is populated)
    requestAnimationFrame(() => {
      initScrollReveal();
      initNavHighlight();
      initThemeToggle();
      initAdmin();
    });

  } catch (error) {
    console.error('[App] Failed to load data.json:', error);
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;
                  font-family:var(--mono);color:var(--text2);text-align:center;padding:40px;">
        <div>
          <p style="font-size:48px;margin-bottom:16px;">⚠</p>
          <p style="font-size:16px;margin-bottom:8px;">Не удалось загрузить данные</p>
          <p style="font-size:13px;color:var(--text3);">Убедитесь, что файл data.json доступен.</p>
        </div>
      </div>
    `;
  }
})();
