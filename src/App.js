// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Home from "./pages/Home";
import Bootstrap from "./pages/Bootstrap";
import FontAwesome from "./pages/FontAwesome";
import Sandbox from "./pages/Sandbox";
import AdobeStock from "./pages/AdobeStock";

const App = () => (
  <Router>
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          ghekoDev
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/bootstrap">
              Bootstrap Samples
            </Nav.Link>
            <Nav.Link as={Link} to="/fontawesome">
              FontAwesome Samples
            </Nav.Link>
            <Nav.Link as={Link} to="/sandbox">
              Sandbox
            </Nav.Link>
            <Nav.Link as={Link} to="/adobe-stock">
              Stock Images
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <Container className="mt-3">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bootstrap" element={<Bootstrap />} />
        <Route path="/fontawesome" element={<FontAwesome />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/adobe-stock" element={<AdobeStock />} />
      </Routes>
    </Container>
  </Router>
);

export default App;
