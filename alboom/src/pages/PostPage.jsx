// Un posteo solo (/post/:postId): adonde lleva "Copiar link" del menú Compartir.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToPost } from '../services/posts';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import FeedItem from '../components/FeedItem';
import Loader from '../components/Loader';
import './CommunityPage.css';

export default function PostPage() {
  const { postId } = useParams();
  const [state, setState] = useState({ postId: null, post: null });

  useEffect(() => {
    return subscribeToPost(
      postId,
      (post) => setState({ postId, post }),
      () => setState({ postId, post: null }),
    );
  }, [postId]);

  const loading = state.postId !== postId;

  return (
    <div className="page community__single">
      {loading && <Loader size={64} label="Cargando posteo…" />}
      {!loading && !state.post && (
        <EmptyState title="Este posteo ya no existe" text="Puede que lo hayan borrado.">
          <Button to="/comunidad" size="sm">
            Ir a Comunidad
          </Button>
        </EmptyState>
      )}
      {!loading && state.post && <FeedItem post={state.post} />}
    </div>
  );
}
