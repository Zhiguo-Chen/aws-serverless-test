import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from '../header/header';

const MainLayout = () => (
  <div className="main-layout-container">
    <header className="sticky-header">
      <Header></Header>
    </header>
    <div className="main-content">
      <Outlet></Outlet>
    </div>
  </div>
);

export default MainLayout;
