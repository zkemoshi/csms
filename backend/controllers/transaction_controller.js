import Transaction from '../models/transaction_model.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export async function getAllTransactions(req, res, next) {
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
            filter.startTimestamp = {};
            if (startDate) filter.startTimestamp.$gte = new Date(startDate);
            if (endDate) filter.startTimestamp.$lte = new Date(endDate);
        }

        // Pagination
        const skip = (page - 1) * limit;
        
        const transactions = await Transaction.find(filter)
            .sort({ startTimestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(filter);

        res.json({
            transactions,
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export async function getTransactionById(req, res, next) {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (e) {
        next(e);
    }
}

// @desc    Get transaction by transaction ID
// @route   GET /api/transactions/transaction/:transactionId
// @access  Private
export async function getTransactionByTransactionId(req, res, next) {
    try {
        const transaction = await Transaction.findOne({ 
            transactionId: req.params.transactionId 
        });
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (e) {
        next(e);
    }
}

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export async function createTransaction(req, res, next) {
    try {
        const transaction = await Transaction.create(req.body);
        res.status(201).json(transaction);
    } catch (e) {
        next(e);
    }
}

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export async function updateTransaction(req, res, next) {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (e) {
        next(e);
    }
}

// @desc    Stop transaction
// @route   PUT /api/transactions/:id/stop
// @access  Private
export async function stopTransaction(req, res, next) {
    try {
        const { meterStop, stopReason } = req.body;
        
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status === 'Stopped') {
            return res.status(400).json({ error: 'Transaction already stopped' });
        }

        transaction.meterStop = meterStop;
        transaction.stopTimestamp = new Date();
        transaction.stopReason = stopReason;
        transaction.status = 'Stopped';

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    } catch (e) {
        next(e);
    }
}

// @desc    Add meter values to transaction
// @route   POST /api/transactions/:id/meter-values
// @access  Private
export async function addMeterValues(req, res, next) {
    try {
        const { meterValues } = req.body;
        
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (transaction.status === 'Stopped') {
            return res.status(400).json({ error: 'Cannot add meter values to stopped transaction' });
        }

        transaction.meterValues.push(...meterValues);
        const updatedTransaction = await transaction.save();
        
        res.json(updatedTransaction);
    } catch (e) {
        next(e);
    }
}

// @desc    Get transactions by station
// @route   GET /api/transactions/station/:stationId
// @access  Private
export async function getTransactionsByStation(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ 
            stationId: req.params.stationId 
        })
        .sort({ startTimestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Transaction.countDocuments({ 
            stationId: req.params.stationId 
        });

        res.json({
            transactions,
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

// @desc    Get active transactions
// @route   GET /api/transactions/active
// @access  Private
export async function getActiveTransactions(req, res, next) {
    try {
        const transactions = await Transaction.find({ status: 'Active' })
            .sort({ startTimestamp: -1 });
        
        res.json(transactions);
    } catch (e) {
        next(e);
    }
}

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
export async function deleteTransaction(req, res, next) {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (e) {
        next(e);
    }
}

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export async function getTransactionStats(req, res, next) {
    try {
        const { stationId, startDate, endDate } = req.query;
        
        const filter = {};
        if (stationId) filter.stationId = stationId;
        if (startDate || endDate) {
            filter.startTimestamp = {};
            if (startDate) filter.startTimestamp.$gte = new Date(startDate);
            if (endDate) filter.startTimestamp.$lte = new Date(endDate);
        }

        const stats = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalTransactions: { $sum: 1 },
                    activeTransactions: {
                        $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                    },
                    totalEnergy: {
                        $sum: { $subtract: ['$meterStop', '$meterStart'] }
                    },
                    avgDuration: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$stopTimestamp', '$startTimestamp'] },
                                1000 * 60 // Convert to minutes
                            ]
                        }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            totalTransactions: 0,
            activeTransactions: 0,
            totalEnergy: 0,
            avgDuration: 0
        });
    } catch (e) {
        next(e);
    }
}

