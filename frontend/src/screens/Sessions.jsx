import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Modal,
    Form,
    Badge,
    Alert,
    Spinner,
    InputGroup,
    FormControl,
    ProgressBar,
    Pagination
} from 'react-bootstrap';
import {
    useGetSessionsQuery,
    useGetSessionStatsQuery,
    useGetActiveSessionsQuery,
    useCompleteSessionMutation,
    useDeleteSessionMutation,
    useMarkOcpiSentMutation
} from '../slices/sessionsApiSlice';
import {
    useGetStationsQuery
} from '../slices/stationsApiSlice';

const Sessions = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [sessionsPerPage, setSessionsPerPage] = useState(10);

    // API hooks with pagination
    const { data: sessionsData, isLoading, error, refetch } = useGetSessionsQuery({
        page: currentPage,
        limit: sessionsPerPage
    });
    const { data: stats } = useGetSessionStatsQuery();
    const { data: activeSessions } = useGetActiveSessionsQuery();
    const { data: stations } = useGetStationsQuery();
    const [completeSession] = useCompleteSessionMutation();
    const [deleteSession] = useDeleteSessionMutation();
    const [markOcpiSent] = useMarkOcpiSentMutation();

    // Extract data
    const sessions = sessionsData?.sessions || [];
    const pagination = sessionsData?.pagination;

    // Local state
    const [showModal, setShowModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stationFilter, setStationFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin');
        }
    }, [userInfo, navigate]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, stationFilter, dateFilter.startDate, dateFilter.endDate]);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle sessions per page change
    const handleSessionsPerPageChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setSessionsPerPage(newLimit);
        setCurrentPage(1); // Reset to first page when changing limit
    };

    // Generate pagination items
    const generatePaginationItems = () => {
        if (!pagination || pagination.pages <= 1) return [];

        const items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            items.push(
                <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis1" />);
            }
        }

        // Visible pages
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Last page
        if (endPage < pagination.pages) {
            if (endPage < pagination.pages - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis2" />);
            }
            items.push(
                <Pagination.Item
                    key={pagination.pages}
                    onClick={() => handlePageChange(pagination.pages)}
                >
                    {pagination.pages}
                </Pagination.Item>
            );
        }

        return items;
    };

    // Handle session completion
    const handleCompleteSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to complete this session?')) {
            try {
                await completeSession({
                    id: sessionId,
                    stopTime: new Date(),
                    energyWh: 0 // You might want to get this from meter values
                }).unwrap();
                refetch();
            } catch (error) {
                console.error('Error completing session:', error);
            }
        }
    };

    // Handle session deletion
    const handleDeleteSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            try {
                await deleteSession(sessionId).unwrap();
                refetch();
            } catch (error) {
                console.error('Error deleting session:', error);
            }
        }
    };

    // Handle OCPI sync
    const handleOcpiSync = async (sessionId) => {
        try {
            await markOcpiSent(sessionId).unwrap();
            refetch();
        } catch (error) {
            console.error('Error marking OCPI sent:', error);
        }
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            'IN_PROGRESS': 'primary',
            'COMPLETED': 'success'
        };
        return colors[status] || 'secondary';
    };

    // Format duration
    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Format energy
    const formatEnergy = (energyWh) => {
        if (!energyWh) return '-';
        return `${(energyWh / 1000).toFixed(2)} kWh`;
    };

    // Calculate session duration for active sessions
    const getSessionDuration = (startTime) => {
        if (!startTime) return 0;
        const start = new Date(startTime);
        const now = new Date();
        return Math.floor((now - start) / (1000 * 60)); // minutes
    };

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container fluid>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <h1>Charging Sessions</h1>
                    <p className="text-muted">Monitor and manage charging sessions</p>
                </Col>
            </Row>

            {/* Statistics Cards */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <h4>{stats.totalSessions || 0}</h4>
                                <small className="text-muted">Total Sessions</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center border-primary">
                            <Card.Body>
                                <h4 className="text-primary">{stats.activeSessions || 0}</h4>
                                <small className="text-muted">Active Sessions</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center border-success">
                            <Card.Body>
                                <h4 className="text-success">{stats.completedSessions || 0}</h4>
                                <small className="text-muted">Completed</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center border-info">
                            <Card.Body>
                                <h4 className="text-info">{formatEnergy(stats.totalEnergy)}</h4>
                                <small className="text-muted">Total Energy</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Row className="mb-3">
                <Col md={3}>
                    <InputGroup>
                        <FormControl
                            placeholder="Search sessions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary">
                            <i className="fas fa-search"></i>
                        </Button>
                    </InputGroup>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={stationFilter}
                        onChange={(e) => setStationFilter(e.target.value)}
                    >
                        <option value="all">All Stations</option>
                        {stations?.stations?.map(station => (
                            <option key={station.stationId} value={station.stationId}>
                                {station.stationId}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        placeholder="Start Date"
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        placeholder="End Date"
                    />
                </Col>
                <Col md={1}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => refetch()}
                    >
                        <i className="fas fa-refresh"></i>
                    </Button>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger">
                            Error loading sessions: {error?.data?.message || error?.error || 'Unknown error'}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Sessions Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>Sessions</h5>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <small className="text-muted">Show:</small>
                                        <Form.Select
                                            size="sm"
                                            style={{ width: 'auto' }}
                                            value={sessionsPerPage}
                                            onChange={handleSessionsPerPageChange}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </Form.Select>
                                    </div>
                                    <small className="text-muted">
                                        Showing {sessions.length} of {pagination?.total || 0} sessions
                                        {pagination && ` (Page ${pagination.page} of ${pagination.pages})`}
                                    </small>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Session ID</th>
                                        <th>Station</th>
                                        <th>Connector</th>
                                        <th>User (ID Tag)</th>
                                        <th>Start Time</th>
                                        <th>Duration</th>
                                        <th>Energy</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">
                                                <div className="text-muted">
                                                    No sessions found
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sessions.map((session) => (
                                            <tr key={session._id}>
                                                <td>
                                                    <div>
                                                        <strong>{session.sessionId}</strong>
                                                        <div className="text-muted small">
                                                            TX: {session.transactionId}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{session.stationId}</td>
                                                <td>{session.connectorId}</td>
                                                <td>
                                                    <div>
                                                        <strong>{session.idTag}</strong>
                                                        {session.socStart && (
                                                            <div className="text-muted small">
                                                                SoC: {session.socStart}% → {session.socEnd || '-'}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {new Date(session.startTime).toLocaleString()}
                                                    {session.stopTime && (
                                                        <div className="text-muted small">
                                                            End: {new Date(session.stopTime).toLocaleString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {session.status === 'IN_PROGRESS' ? (
                                                        <div>
                                                            <div>{formatDuration(getSessionDuration(session.startTime))}</div>
                                                            <ProgressBar 
                                                                now={getSessionDuration(session.startTime)} 
                                                                max={120} 
                                                                size="sm"
                                                                variant="info"
                                                            />
                                                        </div>
                                                    ) : (
                                                        formatDuration(session.durationMinutes)
                                                    )}
                                                </td>
                                                <td>{formatEnergy(session.energyWh)}</td>
                                                <td>
                                                    <Badge bg={getStatusColor(session.status)}>
                                                        {session.status}
                                                    </Badge>
                                                    {session.ocpiSent && (
                                                        <div className="text-muted small">OCPI ✓</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedSession(session);
                                                                setShowModal(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Button>
                                                        {session.status === 'IN_PROGRESS' && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handleCompleteSession(session._id)}
                                                            >
                                                                <i className="fas fa-stop"></i>
                                                            </Button>
                                                        )}
                                                        {session.status === 'COMPLETED' && !session.ocpiSent && (
                                                            <Button
                                                                variant="outline-warning"
                                                                size="sm"
                                                                onClick={() => handleOcpiSync(session._id)}
                                                            >
                                                                <i className="fas fa-sync"></i>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteSession(session._id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <Row className="mt-3">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sessions
                                </small>
                            </div>
                            <Pagination>
                                <Pagination.First 
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                />
                                <Pagination.Prev 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                />
                                
                                {generatePaginationItems()}
                                
                                <Pagination.Next 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                />
                                <Pagination.Last 
                                    onClick={() => handlePageChange(pagination.pages)}
                                    disabled={currentPage === pagination.pages}
                                />
                            </Pagination>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Session Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Session Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSession && (
                        <Row>
                            <Col md={6}>
                                <h6>Session Information</h6>
                                <p><strong>Session ID:</strong> {selectedSession.sessionId}</p>
                                <p><strong>Transaction ID:</strong> {selectedSession.transactionId}</p>
                                <p><strong>Station:</strong> {selectedSession.stationId}</p>
                                <p><strong>Connector:</strong> {selectedSession.connectorId}</p>
                                <p><strong>User:</strong> {selectedSession.idTag}</p>
                                <p><strong>Status:</strong> 
                                    <Badge bg={getStatusColor(selectedSession.status)} className="ms-2">
                                        {selectedSession.status}
                                    </Badge>
                                </p>
                            </Col>
                            <Col md={6}>
                                <h6>Timing & Energy</h6>
                                <p><strong>Start Time:</strong> {new Date(selectedSession.startTime).toLocaleString()}</p>
                                {selectedSession.stopTime && (
                                    <p><strong>End Time:</strong> {new Date(selectedSession.stopTime).toLocaleString()}</p>
                                )}
                                <p><strong>Duration:</strong> {formatDuration(selectedSession.durationMinutes)}</p>
                                <p><strong>Energy:</strong> {formatEnergy(selectedSession.energyWh)}</p>
                                {selectedSession.socStart && (
                                    <p><strong>State of Charge:</strong> {selectedSession.socStart}% → {selectedSession.socEnd || '-'}%</p>
                                )}
                                <p><strong>OCPI Sent:</strong> {selectedSession.ocpiSent ? 'Yes' : 'No'}</p>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Sessions;