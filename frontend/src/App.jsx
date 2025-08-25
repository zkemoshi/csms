import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';


const App = () => {
  const { userInfo } = useSelector((state) => state.auth);


  useEffect(() => {
    const isFirstLogin = sessionStorage.getItem("justLoggedIn");
    if (userInfo && isFirstLogin) {
      sessionStorage.removeItem("justLoggedIn");
      window.location.reload(); // 🚀 Trigger once after login
    }
  }, [userInfo]);

 
  return (
    <>
      <Header />
      <ToastContainer />
      <Container className='my-2'>
        <Outlet />
      </Container>
      
    </>
  );
};

export default App;
