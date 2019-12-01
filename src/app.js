const Koa = require('koa');
const { port, root, ip } = require('~/config');
const router = require('./router');
const { log, jsonParser, onError } = require('./utils');
const cors = require('@koa/cors');
const http = require('http');
const static = require('koa-static');

const app = new Koa();
app.proxy = true;

app
    .use(static(`${root}/public`))
    .use(cors())
    .use(async (ctx, next) => {
        const b = Date.now();
        await next();
        const a = new Date();
        const p = (ctx.status > 201) ? 'error' : 'mark';
        log[p](a.toISOString().slice(0, 10) + ' ' + a.toLocaleTimeString(),
            ctx.method, ctx.url, ctx.status, ((a.getTime() - b)) + 'ms');
    })
    .use(jsonParser)
    .use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            onError(ctx, { error: err.message }, err.status || 500);
            ctx.app.emit('error', err, ctx);
        }
    })
    .use(router.routes())
    .use(router.allowedMethods());

let server;

(() => {
    {
        // launch the server
        server = http.createServer(app.callback()).listen(port, ip, () => {
            console.log(`Server is running on ${port}`);
        });
    }
})();

