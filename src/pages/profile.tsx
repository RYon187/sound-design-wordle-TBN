import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth_context';

interface ProfileInfo {
  user_id: number;
  username: string;
}

function Profile() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileId = id === undefined ? user?.id : Number(id);

  const [result, setResult] = useState<{
    profileId: number;
    profile?: ProfileInfo;
    error?: string;
  } | null>(null);
  
  // if the currently authenticated user_id is equal to the profile user_id, then you own the profile
  const isOwnProfile = profileId !== undefined && profileId === user?.id;

  useEffect(() => {
    if (profileId === undefined || !Number.isInteger(profileId) || profileId <= 0) return;

    const currentProfileId = profileId;
    let active = true;

    async function fetchProfile() {
      try {
        const response = await fetch(`http://localhost:3000/users/${currentProfileId}/profile`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'User not found' : 'Failed to load profile');
        }

        const data: ProfileInfo = await response.json();

        if (active) {
          setResult({ profileId: currentProfileId, profile: data });
        }
        
      } catch (fetchError) {
        if (active) {
          setResult({
            profileId: currentProfileId,
            error: fetchError instanceof Error ? fetchError.message : 'Failed to load profile',
          });
        }
      }
    }

    void fetchProfile();

    return () => {
      active = false;
    };
  }, [profileId]);

  if (profileId === undefined) {
    return <p>Log in to view your profile</p>;
  }

  if (!Number.isInteger(profileId) || profileId <= 0) {
    return <p>Invalid profile</p>;
  }

  if (!result || result.profileId !== profileId) {
    return <p>Loading profile...</p>;
  }

  if (result.error) {
    return <p>{result.error}</p>;
  }

  const profile = result.profile;
  if (!profile) {
    return <p>Profile not found</p>;
  }

  return (
    <main>
      <h1>{isOwnProfile ? `Welcome, ${profile.username}` : `${profile.username}'s profile`}</h1>
      {isOwnProfile && (
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Log Out
        </button>
      )}
    </main>
  );
}

export default Profile;
