// Un elemento del feed. Si es un "compartido", muestra el posteo original (en vivo) con
// "⟲ Juli compartió" arriba; si no, el posteo directo.

import { useEffect, useState } from 'react';
import { subscribeToPost } from '../services/posts';
import PostCard from './PostCard';

export default function FeedItem({ post, showFollow }) {
  if (post.type !== 'repost') return <PostCard post={post} reason={post.reason} showFollow={showFollow} />;
  return <RepostItem repost={post} />;
}

function RepostItem({ repost }) {
  const [state, setState] = useState({ id: null, original: null });

  // CONSULTAR el posteo original en tiempo real (así sus contadores están al día).
  useEffect(() => {
    return subscribeToPost(
      repost.repostOf,
      (original) => setState({ id: repost.repostOf, original }),
      () => setState({ id: repost.repostOf, original: null }),
    );
  }, [repost.repostOf]);

  if (state.id !== repost.repostOf || !state.original) return null; // cargando o el original se borró
  return <PostCard post={state.original} repostedBy={repost.displayName.split(' ')[0]} />;
}
