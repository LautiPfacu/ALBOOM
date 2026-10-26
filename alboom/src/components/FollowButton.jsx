// "Seguir" / "Siguiendo ✓". El estado sale de FollowContext (Firestore en tiempo real).

import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import Button from './Button';

export default function FollowButton({ uid, name, size = 'sm' }) {
  const { user } = useAuth();
  const { isFollowing, isPending, toggleFollow } = useFollow();
  if (uid === user.uid) return null;

  const following = isFollowing(uid);
  const pending = isPending(uid);

  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      size={size}
      pending={pending}
      aria-pressed={following}
      aria-label={following ? `Dejar de seguir a ${name}` : `Seguir a ${name}`}
      onClick={() => toggleFollow(uid, name)}
    >
      {following ? '✓ Siguiendo' : 'Seguir'}
    </Button>
  );
}
