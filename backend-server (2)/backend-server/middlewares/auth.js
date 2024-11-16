const isAuthenticated = async (req, res, next) => {
  const { cookieToken } = req.cookies;

  if(!cookieToken) {
    return res.status(404).json({
      success: false,
      message: "Login First",
    });
  }

  next();
}

module.exports = { isAuthenticated };