import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserProfile {
  first_name: string;
  last_name: string;
  professional_type: string;
  speciality?: string;
  avatar_url?: string;
}

export function useUserProfile() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  return { userProfile, loading, error };
}
