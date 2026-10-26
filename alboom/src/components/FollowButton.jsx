// "Seguir" / "Siguiendo ✓". El estado sale de FollowContext (Firestore en tiempo real).

import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import Button from './Button';
import { useRequireAccount } from '../hooks/useRequireAccount';
import { useT } from '../i18n/LanguageContext';

export default function FollowButton({ uid, name, size = 'sm' }) {
  const requireAccount = useRequireAccount();
  const t = useT();
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
      aria-label={following ? t('Dejar de seguir a {name}', { name }) : t('Seguir a {name}', { name })}
      onClick={() => {
        if (requireAccount()) return;
        toggleFollow(uid, name);
      }}
    >
      {following ? '✓ Siguiendo' : 'Seguir'}
    </Button>
  );
}
