const validateOrder = (req, res, next) => {
    const { items, deliveryAddress } = req.body;
    const errors = {};

    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.items = 'Items array cannot be empty';
    } else {
        items.forEach((item, index) => {
            if (!item.quantity || item.quantity < 1) {
                errors[`items[${index}]`] = 'Invalid item format. Requires quantity >= 1';
            }
            if (!item.isCustom && !item.pizza) {
                errors[`items[${index}]`] = 'Invalid item format. Non-custom items require pizza ID';
            }
        });
    }

    if (!deliveryAddress) {
        errors.deliveryAddress = 'Delivery address is required';
    } else {
        const requiredFields = ['recipientName', 'street', 'city', 'state', 'zipCode', 'phone'];
        requiredFields.forEach(field => {
            if (!deliveryAddress[field]) {
                errors[`deliveryAddress.${field}`] = `${field} is required`;
            }
        });
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: errors });
    }

    next();
};

module.exports = { validateOrder };
