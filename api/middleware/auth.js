const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
	const authHeader = req.headers['authorization'] || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'No token provided' });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.user = { id: decoded.id, role: decoded.role };
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}
