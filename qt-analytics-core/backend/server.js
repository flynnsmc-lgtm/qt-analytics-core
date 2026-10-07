/**
 * QT Analytics Backend Gateway - Core Invariant Physics Binding
 * Integrates 4D Manifold, GMRF Tension, Entity Mass, and SHA-256 State Sealing.
 */

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve the frontend UI
app.use(express.static(path.join(__dirname, '../frontend')));

const KAPPA_FRICTION = 0.25;

app.post('/api/v1/seal-forensic-state', (req, res) => {
    try {
        const { transactions } = req.body;
        const timestamp = Date.now();

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ error: "Invalid transaction payload for manifold construction." });
        }

        // Dimension 1: Extract Entities & Build Base Manifold
        const entities = new Set();
        transactions.forEach(tx => {
            entities.add(tx.sender);
            entities.add(tx.receiver);
        });
        const entityList = Array.from(entities);
        const n = entityList.length;

        // Dimension 2 & 3: Initialize N x N GMRF Matrix, Tension (-T_ij), and Mass (M_ii)
        let matrix = Array(n).fill(0).map(() => Array(n).fill(0.0));
        const indexMap = new Map();
        entityList.forEach((e, idx) => indexMap.set(e, idx));

        transactions.forEach(tx => {
            const u = indexMap.get(tx.sender);
            const v = indexMap.get(tx.receiver);
            if (u !== undefined && v !== undefined && u !== v) {
                const weight = parseFloat((tx.value / 1000000.0).toFixed(6));
                matrix[u][v] -= weight; // Negative binding tension
                matrix[v][u] -= weight; // Symmetric flow vector
            }
        });

        for (let i = 0; i < n; i++) {
            let sumAbsT = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) sumAbsT += Math.abs(matrix[i][j]);
            }
            matrix[i][i] = parseFloat((sumAbsT + KAPPA_FRICTION).toFixed(6));
        }

        // Dimension 4: Cryptographic State Invariance Seal (SHA-256)
        const flatMatrix = matrix.flat().map(val => val.toFixed(6)).join(',');
        const serializationString = `QT-STATE:DIM=${n}:KAPPA=${KAPPA_FRICTION.toFixed(4)}:TIME=${timestamp}:MATRIX=[${flatMatrix}]`;
        const sha256Seal = crypto.createHash('sha256').update(serializationString).digest('hex');

        // Automated Pricing Tier Assignment based on Node Scale
        let tier = "Tier 1 (£49)";
        let price = 49;
        if (n >= 10 && n < 50) { tier = "Tier 2 (£149)"; price = 149; }
        else if (n >= 50) { tier = "Tier 3 (£499)"; price = 499; }

        return res.json({
            status: "STATE_INVARIANT_VALID",
            dimension: `${n} × ${n}`,
            activeNodes: n,
            batchTransfers: transactions.length,
            kappa: KAPPA_FRICTION,
            timestamp: timestamp,
            assignedTier: tier,
            priceGBP: price,
            pairoqAccountRouting: "QT_ANALYTICS_PAIROQ_SETTLEMENT_SECURE",
            seal: sha256Seal,
            serializationString: serializationString
        });

    } catch (err) {
        console.error("Topological Deformation Error:", err);
        return res.status(500).json({ status: "TOPOLOGICAL_DEFORMATION_DETECTED", error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QT Analytics Invariant Engine active on port ${PORT}`);
});
