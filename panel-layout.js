// Handles belong to the panel, so resizing never replaces its controls or text.
export function installPanelLayout() {
  const mobile = () => matchMedia('(max-width: 700px)').matches;
  const entries = new Map();
  const emit = () => window.dispatchEvent(new CustomEvent('ws-layout-change'));
  const dropdowns = [...document.querySelectorAll('.menu,.bv-tools,.bv-options,.bv-guide,.app-language')];
  const position = (menu) => {
    if (!menu.open) return;
    const body = menu.querySelector(':scope > .menu-body,:scope > .bv-tools-body,:scope > .bv-options-body,:scope > .bv-guide-body,:scope > .app-language-menu');
    if (!body) return;
    const anchor = menu.querySelector('summary').getBoundingClientRect();
    const game = menu.matches('.bv-tools,.bv-options,.bv-guide');
    const worldSide = game && !mobile() && document.body.classList.contains('world-only');
    const width = Math.min(innerWidth - 18, worldSide ? Math.min(390, innerWidth * .36) : menu.matches('.bv-guide') ? 580 : menu.matches('.bv-tools,.bv-options') ? 340 : menu.matches('.app-language') ? 180 : menu.dataset.menu === 'mode' ? 304 : 340);
    const left = worldSide ? innerWidth - width - 22 : Math.max(9, Math.min(innerWidth - width - 9, anchor.right - width));
    // Game controls live in the upper rail and always open downwards.
    const below = game || innerHeight - anchor.bottom > 150;
    const top = below ? anchor.bottom + 8 : Math.max(8, anchor.top - Math.min(body.scrollHeight, innerHeight * .65) - 8);
    let lowerEdge = innerHeight - (mobile() ? 76 : 12);
    const action = document.querySelector('.bv-advance');
    if (game && action && !action.hidden) {
      const box = action.getBoundingClientRect();
      if (box.height > 0) lowerEdge = Math.min(lowerEdge, box.top - 12);
    }
    const room = Math.max(48, below ? lowerEdge - top : anchor.top - top - 8);
    body.classList.add('dropdown-positioned');
    body.style.top = top + 'px'; body.style.bottom = 'auto';
    body.style.left = left + 'px';
    body.style.right = 'auto'; body.style.transform = 'none';
    body.style.setProperty('--drop-top', top + 'px');
    body.style.setProperty('--drop-left', left + 'px');
    body.style.setProperty('--drop-width', width + 'px');
    body.style.setProperty('--drop-room', room + 'px');
    body.style.setProperty('--panel-room', room + 'px');
  };
  const install = (panel) => {
    if (entries.has(panel)) return;
    const menu = panel.closest('details.menu,details.bv-tools,details.bv-options,details.bv-guide,details.app-language');
    const handle = document.createElement('button');
    handle.type = 'button'; handle.className = 'panel-resize-handle';
    handle.setAttribute('aria-label', 'Resize panel; double-click to collapse or expand');
    handle.title = 'Drag to resize · double-click to collapse or expand · arrow keys to resize';
    panel.classList.add('resizable-panel');
    panel.append(handle);
    const state = { expanded: 320, moved: false };
    entries.set(panel, state);
    const bottomAnchored = () => !menu && (mobile() || panel.classList.contains('world-ending'));
    const minimum = () => panel.matches('.world-ending') ? 184 : panel.matches('.sheet,.tour-panel,.mandala-note') ? 148 : panel.matches('.index') ? 166 : menu ? 96 : 130;
    const setHeight = (height) => {
      const rect = panel.getBoundingClientRect();
      const room = menu ? parseFloat(panel.style.getPropertyValue('--drop-room')) : bottomAnchored() ? rect.bottom - 76 : innerHeight - rect.top - 24;
      const n = Math.round(Math.max(minimum(), Math.min(height, room || innerHeight * .75)));
      panel.style.setProperty('--panel-room', Math.max(minimum(), room) + 'px');
      panel.style.setProperty('--panel-height', n + 'px');
      panel.dataset.panelHeight = String(n);
      panel.classList.toggle('panel-minimized', n <= minimum() + 8);
      handle.setAttribute('aria-expanded', String(!panel.classList.contains('panel-minimized')));
      if (n > minimum() + 8) state.expanded = n;
      if (!menu) emit();
    };
    const toggle = () => {
      if (panel.classList.contains('panel-minimized')) setHeight(state.expanded);
      else { state.expanded = panel.getBoundingClientRect().height; setHeight(minimum()); }
    };
    handle.addEventListener('dblclick', toggle);
    handle.addEventListener('keydown', event => {
      if (['Enter',' ','ArrowUp','ArrowDown','Home','End'].includes(event.key)) event.stopPropagation();
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
      if (['ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
        event.preventDefault();
        const current = panel.getBoundingClientRect().height;
        const delta = (event.key === 'ArrowDown' ? 32 : -32) * (bottomAnchored() ? -1 : 1);
        setHeight(event.key === 'Home' ? minimum() : event.key === 'End' ? innerHeight : current + delta);
      }
    });
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      const start = event.clientY, height = panel.getBoundingClientRect().height;
      const direction = bottomAnchored() ? -1 : 1;
      handle.setPointerCapture(event.pointerId); document.body.classList.add('resizing-panel');
      const move = e => setHeight(height + (e.clientY - start) * direction);
      const end = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end);
        document.body.classList.remove('resizing-panel');
        if (menu) position(menu);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
    });
  };
  const refresh = () => {
    for (const menu of dropdowns) position(menu);
    for (const [panel] of entries) {
      if (panel.closest('[hidden]') || panel.offsetHeight === 0) continue;
      const handle = panel.querySelector(':scope > .panel-resize-handle');
      if (!panel.closest('details') && mobile()) panel.prepend(handle); else panel.append(handle);
      if (panel.dataset.panelHeight) {
        const rect = panel.getBoundingClientRect();
        const room = panel.closest('details') ? parseFloat(panel.style.getPropertyValue('--drop-room')) : bottomAnchoredPanel(panel) ? rect.bottom - 76 : innerHeight - rect.top - 24;
        panel.style.setProperty('--panel-room', Math.max(130, room) + 'px');
      }
    }
  };
  const bottomAnchoredPanel = panel => mobile() || panel.classList.contains('world-ending');
  document.querySelectorAll('.sheet,.mandala-note,.tour-panel,.index,.lm-panel,.jy-panel,.world-ending,.menu-body,.bv-tools-body,.bv-options-body,.bv-guide-body').forEach(install);
  dropdowns.forEach(menu => menu.addEventListener('toggle', () => position(menu)));
  window.addEventListener('resize', refresh);
  window.addEventListener('ws-layout-change', () => dropdowns.forEach(position));
  // Astronomy panels are constructed on demand by lunar-panels.js.
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches('.lm-panel,.jy-panel')) install(node);
      node.querySelectorAll('.lm-panel,.jy-panel').forEach(install);
    }
  });
  observer.observe(document.querySelector('.panel-dock'), { childList: true, subtree: true });
  refresh();
}
