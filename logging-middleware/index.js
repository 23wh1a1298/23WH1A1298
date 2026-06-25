function loggerMiddleware(req, res, next) {
    const start = Date.now();
    const { method, url, query, body } = req;
    const defaultSend = res.send;

    res.send = function (data) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${method} ${url} - Status: ${res.statusCode} - ${duration}ms`);
        
        if (query && Object.keys(query).length > 0) {
            console.log('Query Parameters:', query);
        }
        if (method !== 'GET' && body && Object.keys(body).length > 0) {
            console.log('Body data:', body);
        }
        
        return defaultSend.apply(res, arguments);
    };

    next();
}

module.exports = loggerMiddleware;