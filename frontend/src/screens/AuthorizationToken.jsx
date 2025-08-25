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
    FormControl
} from 'react-bootstrap';
import {
    useGetTokensQuery,
    useCreateTokenMutation,
    useUpdateTokenMutation,
    useDeleteTokenMutation,
    useActivateTokenMutation,
    useBlockTokenMutation,
    useGetAuthorizationSettingsQuery,
    useUpdateAuthorizationSettingsMutation,
} from '../slices/tokensApiSlice';

const AuthorizationToken = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    // API hooks
    const { data, isLoading, error, refetch } = useGetTokensQuery();
    const { data: authSettings, isLoading: settingsLoading } = useGetAuthorizationSettingsQuery();
    const [updateAuthorizationSettings] = useUpdateAuthorizationSettingsMutation();
    const [createToken] = useCreateTokenMutation();
    const [updateToken] = useUpdateTokenMutation();
    const [deleteToken] = useDeleteTokenMutation();
    const [activateToken] = useActivateTokenMutation();
    const [blockToken] = useBlockTokenMutation();

    const tokens = data?.tokens || [];

    // Local state
    const [showModal, setShowModal] = useState(false);
    const [editingToken, setEditingToken] = useState(null);
    const [acceptAnyTag, setAcceptAnyTag] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        idTag: '',
        status: 'Active',
        validFrom: '',
        validTo: '',
        issuer: '',
        owner: '',
        notes: ''
    });

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin');
        }
    }, [userInfo, navigate]);

    // Load authorization settings
    useEffect(() => {
        if (authSettings) {
            setAcceptAnyTag(authSettings.acceptAnyTag || false);
        }
    }, [authSettings]);

    // Handle authorization mode change
    const handleAuthModeChange = async (checked) => {
        console.log('Switch changed to:', checked); // Debug log
        setAcceptAnyTag(checked);

        try {
            console.log('Updating settings...'); // Debug log
            await updateAuthorizationSettings({
                acceptAnyTag: checked,
                strictValidation: !checked
            }).unwrap();
            console.log('Settings updated successfully'); // Debug log
        } catch (error) {
            console.error('Error updating authorization settings:', error);
            // Revert the UI state if the API call failed
            setAcceptAnyTag(!checked);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingToken) {
                await updateToken({ idTag: editingToken.idTag, ...formData }).unwrap();
            } else {
                await createToken(formData).unwrap();
            }
            setShowModal(false);
            setEditingToken(null);
            resetForm();
            refetch();
        } catch (error) {
            console.error('Error saving token:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            idTag: '',
            status: 'Active',
            validFrom: '',
            validTo: '',
            issuer: '',
            owner: '',
            notes: ''
        });
    };

    // Open modal for editing
    const handleEdit = (token) => {
        setEditingToken(token);
        setFormData({
            idTag: token.idTag,
            status: token.status,
            validFrom: token.validFrom ? new Date(token.validFrom).toISOString().split('T')[0] : '',
            validTo: token.validTo ? new Date(token.validTo).toISOString().split('T')[0] : '',
            issuer: token.issuer || '',
            owner: token.owner || '',
            notes: token.notes || ''
        });
        setShowModal(true);
    };

    // Open modal for creating new token
    const handleCreate = () => {
        setEditingToken(null);
        resetForm();
        setShowModal(true);
    };

    // Handle token actions
    const handleActivate = async (idTag) => {
        try {
            await activateToken(idTag).unwrap();
            refetch();
        } catch (error) {
            console.error('Error activating token:', error);
        }
    };

    const handleBlock = async (idTag) => {
        try {
            await blockToken(idTag).unwrap();
            refetch();
        } catch (error) {
            console.error('Error blocking token:', error);
        }
    };

    const handleDelete = async (idTag) => {
        if (window.confirm('Are you sure you want to delete this token?')) {
            try {
                await deleteToken(idTag).unwrap();
                refetch();
            } catch (error) {
                console.error('Error deleting token:', error);
            }
        }
    };

    // Filter tokens
    const filteredTokens = tokens.filter(token => {
        const matchesSearch = token?.idTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (token?.owner && token?.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (token?.issuer && token?.issuer.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || token?.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            'Active': 'success',
            'Blocked': 'danger',
            'Expired': 'warning',
            'Revoked': 'secondary'
        };
        return colors[status] || 'secondary';
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
                    <h1>Authorization Token Management</h1>
                    <p className="text-muted">Manage RFID tokens and authorization settings</p>
                </Col>
            </Row>

            {/* Settings Card */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>Authorization Settings</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Token Validation Mode</Form.Label>
                                        <div className="d-flex align-items-center">
                                            <Form.Check
                                                type="switch"
                                                id="auth-mode-switch"
                                                checked={acceptAnyTag}
                                                onChange={(e) => handleAuthModeChange(e.target.checked)}
                                                disabled={settingsLoading}
                                                className="me-3"
                                            />
                                            <div>
                                                <div className="fw-bold">
                                                    {acceptAnyTag ? 'Accept Any Tag' : 'Strict Validation'}
                                                </div>
                                                <div className="text-muted small">
                                                    {acceptAnyTag
                                                        ? 'All RFID tags will be accepted without validation'
                                                        : 'Only registered and valid tokens will be accepted'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {/* Debug info */}
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Debug: acceptAnyTag={acceptAnyTag.toString()}, 
                                                settingsLoading={settingsLoading.toString()}, 
                                                authSettings={JSON.stringify(authSettings)}
                                            </small>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex align-items-end h-100">
                                        <Button
                                            variant="primary"
                                            onClick={handleCreate}
                                            className="me-2"
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Token
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => refetch()}
                                        >
                                            <i className="fas fa-refresh me-2"></i>
                                            Refresh
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <FormControl
                            placeholder="Search tokens..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary">
                            <i className="fas fa-search"></i>
                        </Button>
                    </InputGroup>
                </Col>
                <Col md={6}>
                    <div className="btn-group" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="statusFilter"
                            id="filter-all"
                            value="all"
                            checked={statusFilter === 'all'}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <label className="btn btn-outline-secondary" htmlFor="filter-all">All</label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="statusFilter"
                            id="filter-active"
                            value="Active"
                            checked={statusFilter === 'Active'}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <label className="btn btn-outline-success" htmlFor="filter-active">Active</label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="statusFilter"
                            id="filter-blocked"
                            value="Blocked"
                            checked={statusFilter === 'Blocked'}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <label className="btn btn-outline-danger" htmlFor="filter-blocked">Blocked</label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="statusFilter"
                            id="filter-expired"
                            value="Expired"
                            checked={statusFilter === 'Expired'}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <label className="btn btn-outline-warning" htmlFor="filter-expired">Expired</label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="statusFilter"
                            id="filter-revoked"
                            value="Revoked"
                            checked={statusFilter === 'Revoked'}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <label className="btn btn-outline-secondary" htmlFor="filter-revoked">Revoked</label>
                    </div>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger">
                            Error loading tokens: {error?.data?.message || error?.error || 'Unknown error'}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Tokens Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>Tokens ({filteredTokens.length})</h5>
                                <small className="text-muted">
                                    Showing {filteredTokens.length} of {tokens.length} tokens
                                </small>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID Tag</th>
                                        <th>Status</th>
                                        <th>Owner</th>
                                        <th>Issuer</th>
                                        <th>Valid From</th>
                                        <th>Valid To</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTokens.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                <div className="text-muted">
                                                    {tokens.length === 0 ? 'No tokens found' : 'No tokens match your filters'}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTokens.map((token) => (
                                            <tr key={token?.idTag}>
                                                <td>
                                                    <strong>{token?.idTag}</strong>
                                                    {token?.notes && (
                                                        <div className="text-muted small">{token?.notes}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusColor(token?.status)}>
                                                        {token?.status}
                                                    </Badge>
                                                </td>
                                                <td>{token?.owner || '-'}</td>
                                                <td>{token?.issuer || '-'}</td>
                                                <td>
                                                    {token?.validFrom
                                                        ? new Date(token.validFrom).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </td>
                                                <td>
                                                    {token?.validTo
                                                        ? new Date(token?.validTo).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </td>
                                                <td>
                                                    {new Date(token?.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEdit(token)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Button>
                                                        {token?.status === 'Active' ? (
                                                            <Button
                                                                variant="outline-warning"
                                                                size="sm"
                                                                onClick={() => handleBlock(token?.idTag)}
                                                            >
                                                                <i className="fas fa-ban"></i>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handleActivate(token?.idTag)}
                                                            >
                                                                <i className="fas fa-check"></i>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(token?.idTag)}
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

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingToken ? 'Edit Token' : 'Create New Token'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>ID Tag *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="idTag"
                                        value={formData.idTag}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!!editingToken}
                                        placeholder="Enter RFID tag ID"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Blocked">Blocked</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Revoked">Revoked</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Valid From</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="validFrom"
                                        value={formData.validFrom}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Valid To</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="validTo"
                                        value={formData.validTo}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Owner</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="owner"
                                        value={formData.owner}
                                        onChange={handleInputChange}
                                        placeholder="Token owner name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Issuer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="issuer"
                                        value={formData.issuer}
                                        onChange={handleInputChange}
                                        placeholder="Token issuer"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Additional notes about this token"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingToken ? 'Update Token' : 'Create Token'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AuthorizationToken;