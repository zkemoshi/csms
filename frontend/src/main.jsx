import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import store from './store.js';
import { Provider } from 'react-redux';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './screens/SignIn.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import NotFoundScreen from './components/NotFoundScreen.jsx';
import HomeScreen  from './screens/HomeScreen.jsx';
import AuthorizationToken from './screens/AuthorizationToken.jsx';
import Sessions from './screens/Sessions.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/signin" element={<SignIn/>} />
      
      <Route path="" element={<PrivateRoute />}>
         <Route index element={<HomeScreen />} />
         <Route path="/authorization-token" element={<AuthorizationToken />} />
         <Route path="/sessions" element={<Sessions />} />
      </Route>
      {/* Explicit route for a 404 Page Not Found */}
      <Route path="/not-found" element={<NotFoundScreen />} />

      {/* Catch-all route: if nothing else matches, go to NotFoundScreen */}
      <Route path="*" element={<NotFoundScreen />} />
    </Route>
  )
);


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
