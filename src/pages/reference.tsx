import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

// Define the structure of a user returned by PostgreSQL
interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

function Users() {
    const [users, setUsers] = useState<User[]>([]);

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedUsername, setEditedUsername] = useState<string>('');   

    const [errorMessage, setErrorMessage] = useState<string>('');

    // Retrieve users from the database
    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch(
                    'http://localhost:3000/users'
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data: User[] = await response.json();
                setUsers(data);

            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }

        fetchUsers();
    }, []);

    // get a users total score
    async function fetchTotalScore(userId: number) {
        try {
            const response = await fetch(
                `http://localhost:3000/users/${userId}/total-score`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch total score');
            }

            const data = await response.json();

            console.log('Total score:', data.total_score);

        } catch (error) {
            console.error(error);
        }
    }

    // Submit a new user
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage('');

        try {
            console.log('Submitting user:', username, email);

            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add user');
            }

            console.log('User successfully added:', data);

            setUsers(prevUsers => [...prevUsers, data]);
            setUsername('');
            setEmail('');

        } catch (error) {
            console.error('Error adding user:', error);

            setErrorMessage(
                error instanceof Error ? error.message : 'An unknown error occurred'
            );
        }
    }

    // deletion
    async function handleDelete(id: number) {
        
        try {
            const response = await fetch(
                `http://localhost:3000/users/${id}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setUsers(prevUsers =>
                prevUsers.filter(user => user.id !== id)
            );

        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    // update a user
    async function handleUpdate(id: number) {
        try {
            const response = await fetch(
                `http://localhost:3000/users/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: editedUsername
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            // Replace the old user with the updated user
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === id ? data.updatedUser : user
                )
            );

            // Exit editing mode
            setEditingId(null);
            setEditedUsername('');

        } catch (error) {
            console.error('Error updating user:', error);
        }
    }

    return (
        <div>
            <h1>Users</h1>

            {/* User creation form */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setUsername(e.target.value)
                    }
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                    }
                    required
                />

                <button type="submit">
                    Add User
                </button>

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>

            {/* Display users */}z
            {users.map(user => (
                <div key={user.id}>
                    {editingId === user.id ? (
                        // EDITING MODE
                        <div>
                            <input
                                type="text"
                                value={editedUsername}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setEditedUsername(e.target.value)
                                }
                            />

                            <button onClick={() => handleUpdate(user.id)}>
                                Save
                            </button>

                            <button onClick={() => {
                                setEditingId(null);
                                setEditedUsername('');
                            }}>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        // NORMAL MODE
                        <div>
                            <h3>{user.username}</h3>
                            <p>{user.email}</p>

                            <button onClick={() => {
                                setEditingId(user.id);
                                setEditedUsername(user.username);
                            }}>
                                Edit
                            </button>

                            <button onClick={() => handleDelete(user.id)}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Users;
