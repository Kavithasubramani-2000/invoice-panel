const express = require('express');
const { body } = require('express-validator');
const {
  getContacts, getContact, createContact, updateContact, deleteContact
} = require('../controllers/contact.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();
router.use(authMiddleware);

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required').normalizeEmail(),
];

router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', validate(contactValidation), createContact);
router.patch('/:id', validate(contactValidation), updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
