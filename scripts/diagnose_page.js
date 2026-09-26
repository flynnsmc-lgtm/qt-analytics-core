const http = require('http');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9223',
  '--disable-gpu',
  '--no-first-run',
  'http://localhost:3000/index.html'
]);

async function run() {
  let jsonStr = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      jsonStr = await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:9223/json', res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.setTimeout(500, () => { req.destroy(); reject(new Error('timeout')); });
      });
      if (jsonStr) break;
    } catch (e) {}
  }
  if (!jsonStr) throw new Error('Could not connect to Edge DevTools');

  const targets = JSON.parse(jsonStr);
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  if (!pageTarget) {
    console.error('No page target found');
    edge.kill();
    return;
  }

  console.log('Connecting to page:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, ...msg.params.args.map(a => a.value || a.description));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails);
    } else if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  console.log('WebSocket connected!');

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('Reloading page with ignoreCache: true...');
  await send('Page.reload', { ignoreCache: true });

  // Let scripts finish running
  await new Promise(r => setTimeout(r, 3000));

  // Check state of buttons, expansion, minimise, and modal
  const checkRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('eq-card-1');
      const toggleBtn = card ? card.querySelector('.btn-eq-toggle') : null;
      const footerModalBtn = card ? card.querySelector('.btn-eq-footer-modal') : null;
      const drawer = card ? card.querySelector('.eq-expanded-drawer') : null;
      const drawerMinimiseBtn = card ? card.querySelector('.btn-minimise-drawer') : null;
      const modalBackdrop = document.getElementById('equation-modal-backdrop');
      const modalCloseBtn = document.getElementById('modal-btn-close');
      const mathDisplay = card ? card.querySelector('.math-display.interactive-expandable') : null;

      const report = {
        cardFound: !!card,
        toggleBtnFound: !!toggleBtn,
        footerModalBtnFound: !!footerModalBtn,
        drawerFound: !!drawer,
        drawerMinimiseBtnFound: !!drawerMinimiseBtn,
        modalBackdropFound: !!modalBackdrop,
        drawerInitialDisplay: drawer ? window.getComputedStyle(drawer).display : null,
      };

      // Step 1: Click Header Expand Button
      if (toggleBtn) toggleBtn.click();
      report.afterHeaderClick_isExpanded = card ? card.classList.contains('expanded-card') : false;
      report.afterHeaderClick_drawerDisplay = drawer ? window.getComputedStyle(drawer).display : null;
      report.afterHeaderClick_toggleBtnText = toggleBtn ? toggleBtn.innerText.trim() : null;

      // Step 2: Click Drawer Minimise Button
      if (drawerMinimiseBtn) drawerMinimiseBtn.click();
      report.afterMinimiseClick_isExpanded = card ? card.classList.contains('expanded-card') : false;
      report.afterMinimiseClick_drawerDisplay = drawer ? window.getComputedStyle(drawer).display : null;
      report.afterMinimiseClick_toggleBtnText = toggleBtn ? toggleBtn.innerText.trim() : null;

      // Step 3: Click Footer Pop-up View Button
      if (footerModalBtn) footerModalBtn.click();
      report.afterFooterModalClick_modalOpen = modalBackdrop ? modalBackdrop.classList.contains('is-open') : false;
      report.afterFooterModalClick_modalDisplay = modalBackdrop ? window.getComputedStyle(modalBackdrop).display : null;

      // Step 4: Close Modal
      if (modalCloseBtn) modalCloseBtn.click();
      report.afterCloseModalClick_modalOpen = modalBackdrop ? modalBackdrop.classList.contains('is-open') : false;

      // Step 5: Click Math Display Formula
      if (mathDisplay) mathDisplay.click();
      report.afterMathFormulaClick_modalOpen = modalBackdrop ? modalBackdrop.classList.contains('is-open') : false;

      // Clean up modal
      if (modalCloseBtn) modalCloseBtn.click();

      // Check all 7 cards
      report.totalEquationCards = document.querySelectorAll('.equation-card[data-eq]').length;
      report.totalHeaderToggles = document.querySelectorAll('.equation-card .btn-eq-toggle').length;
      report.totalFooterModalBtns = document.querySelectorAll('.equation-card .btn-eq-footer-modal').length;
      report.totalDrawerMinimiseBtns = document.querySelectorAll('.equation-card .btn-minimise-drawer').length;

      return report;
    })()`,
    returnByValue: true
  });

  console.log('EVALUATION RESULTS:', JSON.stringify(checkRes.result ? checkRes.result.result.value : checkRes, null, 2));

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Test error:', err);
  edge.kill();
});
