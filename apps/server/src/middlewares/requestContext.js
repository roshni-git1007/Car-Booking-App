const crypto = require("crypto");

function requestContext(req, res, next) {
  req.requestId = crypto.randomUUID();

  // IP: behind proxies you might need trust proxy, but local dev is fine
  req.clientIp =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "";

  req.userAgent = req.headers["user-agent"] || "";
  next();
}

module.exports = { requestContext };
