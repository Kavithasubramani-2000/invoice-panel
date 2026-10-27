const express = require('express');
const {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateStatus, getNextNumber
} = require('../controllers/invoice.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/next-number', getNextNumber);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.patch('/:id', updateInvoice);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteInvoice);

module.exports = router;
