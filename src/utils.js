const rawBody = require('raw-body');
const logger = require('color-log');

exports.jsonParser = async (ctx, next) => {
    if (ctx.request.type === 'application/json') {
        try {
            // parse the body
            ctx.request.body = JSON.parse(await rawBody(ctx.req, {
                encoding: true,
            }));
        } catch (e) { }
    }
    return next();
}

exports.log = {
    info: (...msg) => {
        logger.info(...msg);
    },
    warn: (...msg) => {
        logger.warn(...msg);
    },
    error: (...msg) => {
        logger.error(...msg);
    },
    mark: (...msg) => {
        logger.mark(...msg);
    },
}

exports.onSuccess = async (ctx, payload, status = 200) => {
    ctx.body = JSON.stringify({
        success: true,
        ...payload
    });
    ctx.status = status;
    ctx.type = 'application/json';
}

exports.onError = async (ctx, payload, status = 500) => {
    ctx.body = JSON.stringify({
        success: false,
        ...payload
    });
    ctx.status = status;
    ctx.type = 'application/json';
}