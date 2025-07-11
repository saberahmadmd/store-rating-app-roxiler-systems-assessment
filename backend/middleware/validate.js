const validateUser = (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address) {
    return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ errors: [{ msg: 'Invalid email format' }] });
  }

  if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(password)) {
    return res.status(400).json({
      errors: [{ msg: 'Password must be 8-16 characters with at least one uppercase and one special character' }],
    });
  }

  if (role && !['user', 'store_owner', 'admin'].includes(role)) {
    return res.status(400).json({ errors: [{ msg: 'Invalid role' }] });
  }

  next();
};

module.exports = { validateUser };