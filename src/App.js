import React, { useEffect } from 'react';
import { Redirect, Route, BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toaster from 'toasted-notes';
import io from 'socket.io-client';

import Instance from './components/Instance';
import ThreadManager from './components/ThreadManager';
import AddDriver from './components/AddDriver';
import DriverDesigner from './components/DriverDesigner';
import Dashboard from './components/Dashboard';
import Diagnostics from './components/Terminal';
import Settings from './components/Settings';
import Logs from './components/Diagnostics';
import LoadScreen from './components/LoadScreen';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Version from './components/Version';

import {
  toScreen,
  getFile,
  changePermissions,
  getManifest,
  getDeviceMap,
  isLoading as setLoadingAction,
  updateSocket,
  updateDeviceCount,
  updateInstanceCount,
  addUserId,
  updateProgress,
} from './store/actions';

import './App.css';
import './assets/css/style-dark.css';
import './assets/css/font-awesome.min.css';
import '../node_modules/toasted-notes/src/styles.css';

const App = () => {
  const dispatch = useDispatch();
  const { app, permissions, file, deviceStatusCount, instanceStatusCount, loading } =
    useSelector(state => state.app);

  useEffect(() => {
    const socket = app.socket;

    socket.emit('file-request');
    socket.emit('get-drivers');
    socket.emit('get-device-statuses');
    socket.emit('start-log');

    socket.on('connect_timeout', () => {
      dispatch(updateSocket(io('http://localhost:3031', { timeout: 360000 })));
    });

    socket.on('driversReturned', drivers => dispatch(getManifest(drivers)));
    socket.on('file-requested', data => dispatch(getFile({ ...data, devices: [] })));
    socket.on('file-updated', data => dispatch(getFile(data)));
    socket.on('update-log', () => {});
    socket.on('inspection', handleInspection);
    socket.on('map-response', map => dispatch(getDeviceMap(map)));
    socket.on('device-statuses-update', statuses => dispatch(updateDeviceCount(statuses)));
    socket.on('decipher-buses', handleBusDecipher);
    socket.on('reconnect', attemptNumber => console.log(attemptNumber));
    socket.on('instance-status', handleInstanceStatus);
    socket.on('to-register-page', () => dispatch(toScreen(<Redirect to="/register" exact />)));
    socket.on('to-login-page', () => dispatch(toScreen(<Redirect to="/login" />)));
    socket.on('login-success', handleLoginSuccess);
    socket.on('notify-event', event => toaster.notify(event, { position: 'top-right' }));
    socket.on('job', () => console.log('Job Info'));
    socket.on('update-progress', (instance, level, totalProgress) =>
      dispatch(updateProgress(instance, level, totalProgress)));
    socket.on('disconnect', () => {});
    socket.on('to-version', () => dispatch(toScreen(<Redirect to="/version" />)));
    socket.on('to-thread-manager', () => dispatch(toScreen(<Redirect to="/thread-manager" />)));

    return () => {
      socket.emit('close');
      socket.close();
    };
  }, [dispatch, app.socket]);

  const handleInspection = () => {};
  const handleBusDecipher = () => {};
  const handleInstanceStatus = data => {
    const { instance, status } = data;
    const onlineIndex = instanceStatusCount.online.findIndex(i => i.id === instance.id);
    const offlineIndex = instanceStatusCount.offline.findIndex(i => i.id === instance.id);

    if (status === 'online') {
      if (onlineIndex < 0) instanceStatusCount.online.push(instance);
      if (offlineIndex > -1) instanceStatusCount.offline = instanceStatusCount.offline.filter(id => id !== instance);
    } else if (status === 'offline') {
      if (offlineIndex < 0) instanceStatusCount.offline.push(instance);
      if (onlineIndex > -1) instanceStatusCount.online = instanceStatusCount.online.filter(id => id !== instance);
    }
    dispatch(updateInstanceCount({ online: instanceStatusCount.online, offline: instanceStatusCount.offline }));
  };

  const handleLoginSuccess = user => {
    dispatch(addUserId(user.clientId));
    dispatch(changePermissions(user.permission));
    dispatch(toScreen(<Redirect to="/" exact />));
  };

  const navigateTo = screen => {
    switch (screen) {
      case 'Login':
        dispatch(toScreen(<Redirect to="/login" />));
        break;
      case 'Register':
        dispatch(toScreen(<Redirect to="/register" />));
        break;
      case 'Dashboard':
        dispatch(toScreen(<Redirect to="/" exact />));
        break;
      case 'Settings':
        dispatch(toScreen(<Redirect to="/settings" />));
        break;
      default:
        break;
    }
  };

  const renderAdminBar = () => (
    <div className="admin-bar">
      <div onClick={() => dispatch(changePermissions('admin'))}>Admin View</div>
      <div onClick={() => dispatch(changePermissions('analytics'))}>Analytics View</div>
      <div onClick={() => dispatch(changePermissions('client'))}>Client View</div>
    </div>
  );

  const instanceRoutes = file.instances.map(instance =>
    instance.aliases.map(alias => (
      <Route
        key={alias}
        path={`/instances/${instance.id}/${alias}`}
        render={props => (
          <Instance
            socket={app.socket}
            name={instance.name}
            id={instance.id}
            alias={alias}
            location={props.location}
            permissions={permissions}
          />
        )}
      />
    ))
  );

  const setLoading = bool => dispatch(setLoadingAction(bool));
  const validate = pass => dispatch(changePermissions(pass));
  const updateFile = fileData => dispatch(getFile(fileData));

  return (
    <BrowserRouter>
      <div className="wrapper theme-4-active pimary-color-red">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          {permissions === 'admin' && renderAdminBar()}
          <div className="pi-navbar-item">Instances</div>
          <div className="pi-navbar-item">Devices</div>
        </nav>
        <div className="page-wrapper">
          <div className="container-fluid">
            {loading && <LoadScreen />}
            {file.screen}
            <Route
              path="/"
              render={props => (
                <Dashboard
                  socket={app.socket}
                  to={navigateTo}
                  file={file}
                  deviceHealth={deviceStatusCount}
                  instancesStatuses={instanceStatusCount}
                />
              )}
              exact
            />
            <Route path="/Driver-Designer" component={DriverDesigner} />
            <Route
              path="/diagnostics"
              render={props => (
                <Diagnostics
                  socket={app.socket}
                  instances={file.instances}
                  isLoading={setLoading}
                  permissions={permissions}
                />
              )}
            />
            <Route
              path="/settings"
              render={props => (
                <Settings
                  socket={app.socket}
                  validatePrivileges={validate}
                  file={file}
                  permissions={permissions}
                  update={updateFile}
                  drivers={file.drivers}
                  map={file.deviceMap}
                />
              )}
            />
            <Route path="/logs" render={props => <Logs instances={file.instances} socket={app.socket} />} />
            <Route path="/register" render={props => <Register to={navigateTo} socket={app.socket} permissions={permissions} />} />
            <Route path="/login" render={props => <Login to={navigateTo} socket={app.socket} />} />
            <Route path="/forget-password" render={props => <ForgotPassword to={navigateTo} socket={app.socket} />} />
            <Route path="/version" component={Version} />
            <Route path="/thread-manager" component={ThreadManager} />
            {instanceRoutes}
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
