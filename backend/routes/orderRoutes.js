const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/orderController');

const router = express.Router();

// public, used by customers to track their order
router.get('/track/:id', ctrl.track);

router.use(auth);

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.post('/upload', upload.fields([{ name: 'fabricPhoto', maxCount: 1 }, { name: 'audioNote', maxCount: 1 }]), ctrl.upload);
router.get('/cleanup', ctrl.cleanupStats);
router.post('/cleanup', ctrl.cleanup);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/stage', ctrl.updateStage);
router.post('/:id/payment', ctrl.addPayment);

module.exports = router;
