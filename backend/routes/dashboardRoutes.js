const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', auth, ctrl.getStats);

module.exports = router;
