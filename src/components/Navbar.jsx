export default function Navbar({
  user,
  currentPage,
  setCurrentPage,
  onLogout,
}) {
  const getInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <nav className="navbar">
      <h2>📰 News AI Dashboard</h2>

      <div className="nav-actions">
        <button
          className={currentPage === "home" ? "nav-link active-nav" : "nav-link"}
          onClick={() => setCurrentPage("home")}
        >
          Home
        </button>

        <button
          className={
            currentPage === "summaries" ? "nav-link active-nav" : "nav-link"
          }
          onClick={() => setCurrentPage("summaries")}
        >
          My Summaries
        </button>

        {!user ? (
          <>
            <button
              className="nav-link"
              onClick={() => setCurrentPage("login")}
            >
              Login
            </button>

            <button
              className="register-nav-btn"
              onClick={() => setCurrentPage("register")}
            >
              Register
            </button>
          </>
        ) : (
          <>
            <button
              className="profile-nav-button"
              onClick={() => setCurrentPage("profile")}
              title="Open profile"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="navbar-profile-image"
                />
              ) : (
                <span className="navbar-profile-placeholder">
                  {getInitial()}
                </span>
              )}
            </button>

            <span className="user-name">
              Hi, {user.name}
            </span>

            <button
              className="logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}