import * as svc from '../services/token_service.js';

export async function create(req, res, next) {
    try { res.status(201).json(await svc.createToken(req.body)); }
    catch (e) { next(e); }
}

export async function read(req, res, next) {
    try {
        const t = await svc.getToken(req.params.idTag);
        if (!t) return res.status(404).json({ error: 'Not found' });
        res.json(t);
    } catch (e) { next(e); }
}

export async function list(req, res, next) {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        
        const filter = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        
        const tokens = await svc.getAllTokens(filter, skip, parseInt(limit));
        const total = await svc.countTokens(filter);

        res.json({
            tokens,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) { next(e); }
}

export async function update(req, res, next) {
    try {
        const t = await svc.updateToken(req.params.idTag, req.body);
        if (!t) return res.status(404).json({ error: 'Not found' });
        res.json(t);
    } catch (e) { next(e); }
}

export async function remove(req, res, next) {
    try {
        const t = await svc.deleteToken(req.params.idTag);
        if (!t) return res.status(404).json({ error: 'Not found' });
        res.json({ deleted: true });
    } catch (e) { next(e); }
}

export async function activate(req, res, next) {
    try { res.json(await svc.updateToken(req.params.idTag, { status: 'Active' })); }
    catch (e) { next(e); }
}

export async function block(req, res, next) {
    try { res.json(await svc.updateToken(req.params.idTag, { status: 'Blocked' })); }
    catch (e) { next(e); }
}

export async function getAuthorizationSettings(req, res, next) {
    try {
        const settings = await svc.getAuthorizationSettings();
        res.json(settings);
    } catch (e) { next(e); }
}

export async function updateAuthorizationSettings(req, res, next) {
    console.log(req.body);
    try {
        const settings = await svc.updateAuthorizationSettings(req.body);
        res.json(settings);
    } catch (e) { next(e); }
}