// forensics.js - Payload ingestion & SHA-256 state sealing router
const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
    res.json({ status: "Forensics router active." });
});

module.exports = router;
