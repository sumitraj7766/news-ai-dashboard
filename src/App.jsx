import { useState } from "react";
import Home from "./pages/Home.jsx";
import MySummaries from "./pages/MySummaries.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Navbar from "./components/Navbar.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage("home");
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCurrentPage("home");
  };

  return (
    <>
      <Navbar
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      {currentPage === "profile" && user && (
  <Profile onProfileUpdate={handleProfileUpdate} />
)}

      {currentPage === "home" && <Home user={user} />}

      {currentPage === "summaries" && (
        user ? (
          <MySummaries />
        ) : (
          <Login
            onLogin={handleLogin}
            goToRegister={() => setCurrentPage("register")}
          />
        )
      )}

      {currentPage === "login" && (
        <Login
          onLogin={handleLogin}
          goToRegister={() => setCurrentPage("register")}
        />
      )}

      {currentPage === "register" && (
        <Register
          goToLogin={() => setCurrentPage("login")}
        />
      )}
    </>
  );
}