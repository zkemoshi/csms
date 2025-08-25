import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation, useGetUserQuery } from "../slices/usersApiSlice";
import { setCredentials, logout } from "../slices/authSlice";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { apiSlice } from "../slices/apiSlice";

const Header = () => {
  const { data, refetch } = useGetUserQuery();
  const { userInfo } = useSelector((state) => state.auth);

  const name = userInfo?.data?.fullName;


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      dispatch(logout());
      await logoutApiCall().unwrap();
      dispatch(apiSlice.util.resetApiState());
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userInfo) refetch();
  }, [userInfo, refetch]);

  useEffect(() => {
    if (data && data.success && data.data) {
      dispatch(setCredentials(data.data));
    }
  }, [dispatch, data]);

  useEffect(() => {
    if (userInfo && userInfo.data) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  return (
    <header>
      <Navbar style={{ backgroundColor: '#292f31' }} variant="dark" expand="lg" collapseOnSelect>
        {/* <Navbar style={{ backgroundColor: '#3c5596' }} variant="dark" expand="lg" collapseOnSelect> */}

        <Container>
          {/* <LinkContainer to={homeRoute}> */}
          <LinkContainer to={'/'}>
            <Navbar.Brand>
              <p style={{ padding: 0, margin: 0 }}>Dashboard</p>
              <div style={{ fontSize: "6px", marginLeft: "8px", color: "lightgrey" }}>
                {name}
              </div>
            </Navbar.Brand>
          </LinkContainer>

          <div className="d-flex align-items-center ms-auto">
            <a
              href="https://wa.me/message/LTWBVLR64FIXO1"
              target="_blank"
              rel="noopener noreferrer"
              className="d-lg-none"
              style={{ color: "white", marginRight: "10px" }}
            >
              <WhatsAppIcon style={{ fontSize: "26px" }} />
            </a>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </div>

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo && (
                <NavDropdown title={`Settings`} id="username">
                  <LinkContainer to="/authorization-token">
                    <NavDropdown.Item>Authorization Tokens</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/sessions">
                    <NavDropdown.Item>Sessions</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/stations">
                    <NavDropdown.Item>Stations</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/users">
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/reports">
                    <NavDropdown.Item>Reports</NavDropdown.Item>
                  </LinkContainer>

                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;