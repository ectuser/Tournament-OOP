const Router = require('koa-router');
const router = new Router();

router
    .get('/', async (ctx) => {
        ctx.body = 'HEHE_XD';
        ctx.status = 200;
        ctx.type = 'text/html';
    });

module.exports = router;