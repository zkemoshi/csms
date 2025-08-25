import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { setCredentials } from '../slices/authSlice';
import { useLoginMutation } from '../slices/usersApiSlice';
import './register.scss';

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await login(formData).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
      toast.success('Login successful!'); 
      setIsLoading(false);
    } catch (err) {
      setError(err.data.message || 'Login failed. Please try again.');
      toast.error(err.data.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            className="title"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                backgroundColor: '#223971',
                '&:hover': {
                  backgroundColor: '#1a2a5a',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: '#223971', 
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box> */}

            {/* <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    color: '#223971', 
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Forgot your password?
                </Link>
              </Typography>
            </Box> */}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignIn;
