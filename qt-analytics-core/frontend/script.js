// Tab Switching Logic
function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active-view');
    });
    
    // Remove active class from nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(`view-${tabId}`).classList.add('active-view');
    
    // Set active nav
    event.currentTarget.classList.add('active');
}

// Ingestion Backend Logic
async function runForensicAudit() {
    const rawInput = document.getElementById('walletInput').value;
    const btn = document.getElementById('executeBtn');
    const resultContainer = document.getElementById('resultContainer');
    
    btn.classList.add('loading');
    btn.disabled = true;
    resultContainer.style.display = 'none';

    let payload;
    try {
        let parsed = JSON.parse(rawInput);
        if (Array.isArray(parsed)) { payload = { transactions: parsed }; } 
        else if (parsed.transactions) { payload = parsed; } 
        else { throw new Error("Invalid format"); }
    } catch (e) {
        const trimmed = rawInput.trim() || "0xUnknownInput";
        payload = {
            transactions: [
                { sender: trimmed, receiver: "Target_Wallet_Null", value: 10000000 },
                { sender: "Target_Wallet_Null", receiver: "Settlement_Node_X", value: 5000000 }
            ]
        };
    }

    const endpoint = '/api/v1/seal-forensic-state';

    try {
        await new Promise(r => setTimeout(r, 600)); // Dramatic latency
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('sealOutput').innerText = data.seal;
            document.getElementById('tierOutput').innerText = data.assignedTier;
            document.getElementById('priceOutput').innerText = `£${data.priceGBP}`;
            document.getElementById('dimensionOutput').innerText = data.dimension;
            document.getElementById('kappaOutput').innerText = data.kappa;
            resultContainer.style.display = 'block';
            
            // Add terminal log for demo effect
            logToTerminal(`[INGESTION] Processed ${data.dimension} manifold. Seal: ${data.seal.substring(0,8)}...`);
        } else {
            alert('Topological deformation detected: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Gateway error:', err);
        alert('Engine Offline. Run the backend server.');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Telemetry Terminal Logger
function logToTerminal(msg) {
    const term = document.getElementById('terminalLog');
    if (term) {
        term.innerHTML += `<br>> ${msg}`;
        term.scrollTop = term.scrollHeight;
    }
}

// Simulated Telemetry updates for Demo Week
setInterval(() => {
    const rate = document.getElementById('ingestionRate');
    if (rate) {
        const jitter = Math.floor(Math.random() * 50) - 25;
        rate.innerText = `${842 + jitter} tx/s`;
    }
    
    // Occasionally log to terminal
    if (Math.random() > 0.8) {
        logToTerminal(`[SYSTEM] Heartbeat OK. Pairoq link stable.`);
    }
}, 2000);
