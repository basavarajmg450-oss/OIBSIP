const User = require('../models/User');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    // Do not allow email, password, role updates here
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (addresses) updateData.addresses = addresses; 

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe };
