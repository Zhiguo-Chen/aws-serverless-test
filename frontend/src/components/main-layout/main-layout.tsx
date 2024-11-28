import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from '../header/header';
// import Header from './Header'; // Assume you have a Header component

const MainLayout = () => (
  <div className="main-layout-container">
    <header className="sticky-header">
      <Header></Header>
    </header>
    <div className="main-content">
      <Outlet></Outlet> {/* This is where nested routes will be rendered */}
    </div>
  </div>
);

export default MainLayout;
