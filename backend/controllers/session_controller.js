import Session from '../models/session_model.js';

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
export async function getAllSessions(req, res, next) {
    try {
        const { 
            stationId, 
            status, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 20 
        } = req.query;

        // Build filter object
        const filter = {};
        if (stationId) filter.stationId = stationId;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.startTime = {};
            if (startDate) filter.startTime.$gte = new Date(startDate);
            if (endDate) filter.startTime.$lte = new Date(endDate);
        }

        // Pagination
        const skip = (page - 1) * limit;
        
        const sessions = await Session.find(filter)
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Session.countDocuments(filter);

        res.json({
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
export async function getSessionById(req, res, next) {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (e) {
        next(e);
    }
}

// @desc    Get session by session ID
// @route   GET /api/sessions/session/:sessionId
// @access  Private
export async function getSessionBySessionId(req, res, next) {
    try {
        const session = await Session.findOne({ 
            sessionId: req.params.sessionId 
        });
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (e) {
        next(e);
    }
}

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private
export async function createSession(req, res, next) {
    try {
        const session = await Session.create(req.body);
        res.status(201).json(session);
    } catch (e) {
        next(e);
    }
}

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
export async function updateSession(req, res, next) {
    try {
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (e) {
        next(e);
    }
}

// @desc    Complete session
// @route   PUT /api/sessions/:id/complete
// @access  Private
export async function completeSession(req, res, next) {
    try {
        const { stopTime, energyWh, socEnd } = req.body;
        
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Session already completed' });
        }

        session.stopTime = stopTime || new Date();
        session.energyWh = energyWh;
        session.socEnd = socEnd;
        session.status = 'COMPLETED';
        
        // Calculate duration in minutes
        const durationMs = session.stopTime - session.startTime;
        session.durationMinutes = Math.round(durationMs / (1000 * 60));

        const updatedSession = await session.save();
        res.json(updatedSession);
    } catch (e) {
        next(e);
    }
}

// @desc    Get sessions by station
// @route   GET /api/sessions/station/:stationId
// @access  Private
export async function getSessionsByStation(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const sessions = await Session.find({ 
            stationId: req.params.stationId 
        })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Session.countDocuments({ 
            stationId: req.params.stationId 
        });

        res.json({
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Get sessions by user (idTag)
// @route   GET /api/sessions/user/:idTag
// @access  Private
export async function getSessionsByUser(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const sessions = await Session.find({ 
            idTag: req.params.idTag 
        })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Session.countDocuments({ 
            idTag: req.params.idTag 
        });

        res.json({
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Get active sessions
// @route   GET /api/sessions/active
// @access  Private
export async function getActiveSessions(req, res, next) {
    try {
        const sessions = await Session.find({ status: 'IN_PROGRESS' })
            .sort({ startTime: -1 });
        
        res.json(sessions);
    } catch (e) {
        next(e);
    }
}

// @desc    Get completed sessions
// @route   GET /api/sessions/completed
// @access  Private
export async function getCompletedSessions(req, res, next) {
    try {
        const { startDate, endDate, page = 1, limit = 20 } = req.query;
        
        const filter = { status: 'COMPLETED' };
        if (startDate || endDate) {
            filter.stopTime = {};
            if (startDate) filter.stopTime.$gte = new Date(startDate);
            if (endDate) filter.stopTime.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        
        const sessions = await Session.find(filter)
            .sort({ stopTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Session.countDocuments(filter);

        res.json({
            sessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Mark session as OCPI sent
// @route   PUT /api/sessions/:id/ocpi-sent
// @access  Private
export async function markOcpiSent(req, res, next) {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        session.ocpiSent = true;
        const updatedSession = await session.save();
        
        res.json(updatedSession);
    } catch (e) {
        next(e);
    }
}

// @desc    Get sessions pending OCPI sync
// @route   GET /api/sessions/pending-ocpi
// @access  Private
export async function getPendingOcpiSessions(req, res, next) {
    try {
        const sessions = await Session.find({ 
            status: 'COMPLETED',
            ocpiSent: false 
        }).sort({ stopTime: -1 });
        
        res.json(sessions);
    } catch (e) {
        next(e);
    }
}

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private/Admin
export async function deleteSession(req, res, next) {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ message: 'Session deleted successfully' });
    } catch (e) {
        next(e);
    }
}

// @desc    Get session statistics
// @route   GET /api/sessions/stats
// @access  Private
export async function getSessionStats(req, res, next) {
    try {
        const { stationId, startDate, endDate } = req.query;
        
        const filter = {};
        if (stationId) filter.stationId = stationId;
        if (startDate || endDate) {
            filter.startTime = {};
            if (startDate) filter.startTime.$gte = new Date(startDate);
            if (endDate) filter.startTime.$lte = new Date(endDate);
        }

        const stats = await Session.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    activeSessions: {
                        $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] }
                    },
                    completedSessions: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    totalEnergy: { $sum: '$energyWh' },
                    avgDuration: { $avg: '$durationMinutes' },
                    avgEnergy: { $avg: '$energyWh' }
                }
            }
        ]);

        res.json(stats[0] || {
            totalSessions: 0,
            activeSessions: 0,
            completedSessions: 0,
            totalEnergy: 0,
            avgDuration: 0,
            avgEnergy: 0
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Get sessions by date range
// @route   GET /api/sessions/date-range
// @access  Private
export async function getSessionsByDateRange(req, res, next) {
    try {
        const { startDate, endDate, stationId } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'startDate and endDate are required' 
            });
        }

        const filter = {
            startTime: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (stationId) filter.stationId = stationId;

        const sessions = await Session.find(filter)
            .sort({ startTime: -1 });

        res.json(sessions);
    } catch (e) {
        next(e);
    }
}
