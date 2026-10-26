// "Para vos" de Comunidad: posteos públicos de gente que no seguís, ordenados por afinidad.
//   const { posts, loading, error, hasMore, loadMore } = useForYouFeed(me);
//
// Toma los últimos 100 posteos, saca los tuyos y los de quienes ya seguís, y los ordena por
// coincidencia de géneros y de Top 5 con su autor. Cada posteo trae su motivo (reason).

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { getFollowedByMyFollowing } from '../services/follows';
import { getRecentPosts } from '../services/posts';
import { getProfiles } from '../services/publicProfile';
import { affinityBetween, affinityReason, followedByReason } from '../utils/affinity';
import { translate } from '../i18n/language';

const PAGE_SIZE = 20;

export function useForYouFeed(me) {
  const { user } = useAuth();
  const { followingIds, loading: followLoading } = useFollow();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [state, setState] = useState({ key: null, posts: [], error: null });

  const ready = !followLoading && Boolean(me);
  const key = ready ? `${user.uid}|${followingIds.join(',')}|${(me.genres ?? []).join(',')}` : null;

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    const following = new Set(followingIds);

    async function load() {
      const recent = await getRecentPosts(100);
      const candidates = recent.filter((p) => p.uid !== user.uid && !following.has(p.uid) && p.type !== 'repost');
      const [authors, followedBy, followingProfiles] = await Promise.all([
        getProfiles(candidates.map((p) => p.uid)),
        getFollowedByMyFollowing(followingIds),
        getProfiles(followingIds),
      ]);

      const millis = (v) => (typeof v?.toMillis === 'function' ? v.toMillis() : 0);
      return candidates
        .map((post) => {
          const affinity = affinityBetween(me, authors.get(post.uid));
          const names = (followedBy.get(post.uid) ?? [])
            .map((id) => followingProfiles.get(id)?.displayName?.split(' ')[0])
            .filter(Boolean);
          const reason = followedByReason(names) ?? affinityReason(affinity) ?? translate('Nuevo en la comunidad');
          // Que te lo recomiende gente que seguís suma más que la afinidad sola.
          return { ...post, reason, score: affinity.score + names.length * 2 };
        })
        .sort((a, b) => b.score - a.score || millis(b.createdAt) - millis(a.createdAt));
    }

    load()
      .then((posts) => !cancelled && setState({ key, posts, error: null }))
      .catch(() => !cancelled && setState({ key, posts: [], error: 'No pudimos cargar los posteos.' }));
    return () => {
      cancelled = true;
    };
    // `me` y followingIds ya están representados en `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = !key || state.key !== key;
  const loadMore = useCallback(() => setVisible((v) => v + PAGE_SIZE), []);

  return {
    posts: loading ? [] : state.posts.slice(0, visible),
    loading,
    error: loading ? null : state.error,
    hasMore: !loading && state.posts.length > visible,
    loadMore,
  };
}
