// src/template/Template.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Content from './Content';

function Template(props) {
  const location = useLocation();

  // List of routes where header and footer should be hidden
  const hideHeaderFooterRoutes = ["/admin/login", "/admin/dashboard"];

  // Determine if the current route is one of the routes where the header and footer should be hidden
  const showHeaderFooter = !hideHeaderFooterRoutes.includes(location.pathname);

  return (
    <>
      {showHeaderFooter && <Header />}
      <Content>{props.children}</Content>
      {showHeaderFooter && <Footer />}
    </>
  );
}

export default Template;
