const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/employeeController');

const router = express.Router();
router.use(auth);

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.put('/:id/rates/:suitTypeId', ctrl.setRate);
router.post('/:id/pay', ctrl.paySalary);

module.exports = router;
