// Enhanced Home Screen with station management
import './home.scss';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetStationsQuery, 
  useGetStationStatsQuery 
} from '../slices/stationsApiSlice';

const HomeScreen = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const { data: stations, isLoading, error } = useGetStationsQuery();
    const { data: stats } = useGetStationStatsQuery();
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin');
        }
    }, [userInfo, navigate]);

    // Status color mapping
    const getStatusColor = (status) => {
        const statusColors = {
            'Available': 'success',
            'Preparing': 'warning',
            'Charging': 'primary',
            'SuspendedEV': 'info',
            'SuspendedEVSE': 'info',
            'Finishing': 'warning',
            'Reserved': 'secondary',
            'Unavailable': 'danger',
            'Faulted': 'danger',
            'Offline': 'dark'
        };
        return statusColors[status] || 'secondary';
    };

    // Format last heartbeat
    const formatLastHeartbeat = (lastHeartbeat) => {
        if (!lastHeartbeat) return 'Never';
        const now = new Date();
        const heartbeat = new Date(lastHeartbeat);
        const diffMs = now - heartbeat;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    // Filter stations based on selection
    const getFilteredStations = () => {
        if (!stations?.stations) return [];
        
        switch (selectedFilter) {
            case 'online':
                return stations.stations.filter(station => 
                    ['Available', 'Preparing', 'Charging', 'SuspendedEV', 'SuspendedEVSE', 'Finishing', 'Reserved'].includes(station.status)
                );
            case 'offline':
                return stations.stations.filter(station => 
                    ['Unavailable', 'Faulted', 'Offline'].includes(station.status)
                );
            case 'available':
                return stations.stations.filter(station => station.status === 'Available');
            case 'charging':
                return stations.stations.filter(station => 
                    ['Charging', 'Preparing', 'Finishing'].includes(station.status)
                );
            default:
                return stations.stations;
        }
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

    if (error) {
        return (
            <Container>
                <Alert variant="danger">
                    Error loading stations: {error?.data?.message || error?.error || 'Unknown error'}
                </Alert>
            </Container>
        );
    }

    const filteredStations = getFilteredStations();

    return (
        <Container fluid>
            {/* Header with stats */}
            <Row className="mb-4">
                <Col>
                    <h1 className="mb-3">Charging Stations Dashboard</h1>
                    {stats && (
                        <Row className="mb-3">
                            <Col md={3}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h4>{stats.totalStations}</h4>
                                        <small className="text-muted">Total Stations</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center border-success">
                                    <Card.Body>
                                        <h4 className="text-success">{stats.onlineStations}</h4>
                                        <small className="text-muted">Online</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center border-danger">
                                    <Card.Body>
                                        <h4 className="text-danger">{stats.offlineStations}</h4>
                                        <small className="text-muted">Offline</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="text-center border-primary">
                                    <Card.Body>
                                        <h4 className="text-primary">
                                            {filteredStations.length}
                                        </h4>
                                        <small className="text-muted">Filtered</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Col>
            </Row>

            {/* Filter buttons */}
            <Row className="mb-3">
                <Col>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button 
                            variant={selectedFilter === 'all' ? 'primary' : 'outline-primary'}
                            onClick={() => setSelectedFilter('all')}
                        >
                            All Stations
                        </Button>
                        <Button 
                            variant={selectedFilter === 'online' ? 'success' : 'outline-success'}
                            onClick={() => setSelectedFilter('online')}
                        >
                            Online
                        </Button>
                        <Button 
                            variant={selectedFilter === 'offline' ? 'danger' : 'outline-danger'}
                            onClick={() => setSelectedFilter('offline')}
                        >
                            Offline
                        </Button>
                        <Button 
                            variant={selectedFilter === 'available' ? 'success' : 'outline-success'}
                            onClick={() => setSelectedFilter('available')}
                        >
                            Available
                        </Button>
                        <Button 
                            variant={selectedFilter === 'charging' ? 'primary' : 'outline-primary'}
                            onClick={() => setSelectedFilter('charging')}
                        >
                            Charging
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Stations grid */}
            <Row>
                {filteredStations.length === 0 ? (
                    <Col>
                        <Alert variant="info">
                            No stations found with the current filter.
                        </Alert>
                    </Col>
                ) : (
                    filteredStations.map((station) => (
                        <Col key={station._id} lg={4} md={6} className="mb-3">
                            <Card className="h-100">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <strong>{station.stationId}</strong>
                                    <Badge bg={getStatusColor(station.status)}>
                                        {station.status}
                                    </Badge>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-2">
                                        <small className="text-muted">Vendor:</small>
                                        <div>{station.chargePointVendor || 'N/A'}</div>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted">Model:</small>
                                        <div>{station.chargePointModel || 'N/A'}</div>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted">Firmware:</small>
                                        <div>{station.firmwareVersion || 'N/A'}</div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted">Last Heartbeat:</small>
                                        <div className="text-muted">
                                            {formatLastHeartbeat(station.lastHeartbeat)}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => navigate(`/station/${station._id}`)}
                                        >
                                            View Details
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                            onClick={() => navigate(`/station/${station._id}/monitor`)}
                                        >
                                            Monitor
                                        </Button>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="text-muted">
                                    <small>
                                        Created: {new Date(station.createdAt).toLocaleDateString()}
                                    </small>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Pagination info */}
            {stations?.pagination && (
                <Row className="mt-4">
                    <Col>
                        <div className="text-center text-muted">
                            Showing {filteredStations.length} of {stations.pagination.total} stations
                            {stations.pagination.pages > 1 && (
                                <span> (Page {stations.pagination.page} of {stations.pagination.pages})</span>
                            )}
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default HomeScreen;