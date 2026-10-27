const express = require('express');
const { getAppearance, updateAppearance } = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

router.get('/appearance', getAppearance);
router.put('/appearance', updateAppearance);

module.exports = router;
