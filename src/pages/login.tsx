import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../auth_context';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/users/login/${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login Failed. Is the email correct?');
      }

      const user: User = {
        id: data.user_id,
        username: data.username,
        email: data.email
      };

      login(user);
      navigate('/');

    } catch (error) {
      console.error('Error logging in user:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Sign In</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;