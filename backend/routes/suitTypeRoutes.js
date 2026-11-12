const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/suitTypeController');

const router = express.Router();
router.use(auth);

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
