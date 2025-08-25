import Station from '../models/station_model.js';

// @desc    Get all stations
// @route   GET /api/stations
// @access  Private
export async function getAllStations(req, res, next) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const filter = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        
        const stations = await Station.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Station.countDocuments(filter);

        res.json({
            stations,
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

// @desc    Get station by ID
// @route   GET /api/stations/:id
// @access  Private
export async function getStationById(req, res, next) {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        res.json(station);
    } catch (e) {
        next(e);
    }
}

// @desc    Get station by station ID
// @route   GET /api/stations/station/:stationId
// @access  Private
export async function getStationByStationId(req, res, next) {
    try {
        const station = await Station.findOne({ 
            stationId: req.params.stationId 
        });
        
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        res.json(station);
    } catch (e) {
        next(e);
    }
}

// @desc    Create new station
// @route   POST /api/stations
// @access  Private
export async function createStation(req, res, next) {
    try {
        const station = await Station.create(req.body);
        res.status(201).json(station);
    } catch (e) {
        next(e);
    }
}

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private
export async function updateStation(req, res, next) {
    try {
        const station = await Station.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        res.json(station);
    } catch (e) {
        next(e);
    }
}

// @desc    Update station status
// @route   PUT /api/stations/:id/status
// @access  Private
export async function updateStationStatus(req, res, next) {
    try {
        const { status } = req.body;
        
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        station.status = status;
        const updatedStation = await station.save();
        
        res.json(updatedStation);
    } catch (e) {
        next(e);
    }
}

// @desc    Update station heartbeat
// @route   PUT /api/stations/:id/heartbeat
// @access  Private
export async function updateStationHeartbeat(req, res, next) {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        station.lastHeartbeat = new Date();
        const updatedStation = await station.save();
        
        res.json(updatedStation);
    } catch (e) {
        next(e);
    }
}

// @desc    Get online stations
// @route   GET /api/stations/online
// @access  Private
export async function getOnlineStations(req, res, next) {
    try {
        const onlineStatuses = [
            'Available', 'Preparing', 'Charging', 'SuspendedEV', 
            'SuspendedEVSE', 'Finishing', 'Reserved'
        ];
        
        const stations = await Station.find({ 
            status: { $in: onlineStatuses } 
        }).sort({ lastHeartbeat: -1 });
        
        res.json(stations);
    } catch (e) {
        next(e);
    }
}

// @desc    Get offline stations
// @route   GET /api/stations/offline
// @access  Private
export async function getOfflineStations(req, res, next) {
    try {
        const offlineStatuses = ['Unavailable', 'Faulted', 'Offline'];
        
        const stations = await Station.find({ 
            status: { $in: offlineStatuses } 
        }).sort({ lastHeartbeat: -1 });
        
        res.json(stations);
    } catch (e) {
        next(e);
    }
}

// @desc    Get available stations
// @route   GET /api/stations/available
// @access  Private
export async function getAvailableStations(req, res, next) {
    try {
        const stations = await Station.find({ 
            status: 'Available' 
        }).sort({ lastHeartbeat: -1 });
        
        res.json(stations);
    } catch (e) {
        next(e);
    }
}

// @desc    Get charging stations
// @route   GET /api/stations/charging
// @access  Private
export async function getChargingStations(req, res, next) {
    try {
        const chargingStatuses = ['Charging', 'Preparing', 'Finishing'];
        
        const stations = await Station.find({ 
            status: { $in: chargingStatuses } 
        }).sort({ lastHeartbeat: -1 });
        
        res.json(stations);
    } catch (e) {
        next(e);
    }
}

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
export async function deleteStation(req, res, next) {
    try {
        const station = await Station.findByIdAndDelete(req.params.id);
        
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        res.json({ message: 'Station deleted successfully' });
    } catch (e) {
        next(e);
    }
}

// @desc    Get station statistics
// @route   GET /api/stations/stats
// @access  Private
export async function getStationStats(req, res, next) {
    try {
        const stats = await Station.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalStations = await Station.countDocuments();
        const onlineStations = await Station.countDocuments({
            status: { 
                $in: ['Available', 'Preparing', 'Charging', 'SuspendedEV', 
                      'SuspendedEVSE', 'Finishing', 'Reserved'] 
            }
        });

        res.json({
            totalStations,
            onlineStations,
            offlineStations: totalStations - onlineStations,
            statusBreakdown: stats
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Bulk update station statuses
// @route   PUT /api/stations/bulk-status
// @access  Private/Admin
export async function bulkUpdateStationStatuses(req, res, next) {
    try {
        const { stationIds, status } = req.body;
        
        if (!stationIds || !Array.isArray(stationIds) || !status) {
            return res.status(400).json({ 
                error: 'stationIds array and status are required' 
            });
        }

        const result = await Station.updateMany(
            { _id: { $in: stationIds } },
            { status }
        );

        res.json({
            message: `Updated ${result.modifiedCount} stations`,
            modifiedCount: result.modifiedCount
        });
    } catch (e) {
        next(e);
    }
}
