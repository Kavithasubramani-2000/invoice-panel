const User = require('../models/User');

// GET /api/settings/appearance
const getAppearance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('appearanceSettings');
    return res.json({ success: true, data: user.appearanceSettings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/appearance
const updateAppearance = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { appearanceSettings: req.body },
      { new: true, runValidators: true }
    ).select('appearanceSettings');
    return res.json({ success: true, data: user.appearanceSettings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAppearance, updateAppearance };
