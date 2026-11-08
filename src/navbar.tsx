import { Link } from 'react-router-dom';
import { useAuth } from './auth_context';

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Game</Link>
        <Link to="/leaderboards">Leaderboards</Link>

        {user && (
          <Link to="/dev">Dev Stats</Link>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <Link to="/profile">
            {user.username}
          </Link>
        ) : (
          <Link to="/login">Log In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;