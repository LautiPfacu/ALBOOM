// Un posteo de la comunidad: reseña, "escuchó" o "actualizó su Top 5".
//   <PostCard post={post} reason="Porque te gusta el rock nacional" repostedBy="Juli" />
//   <PostCard post={reseña} readOnly />   → sin me gusta, respuestas ni compartir (pestaña "Reseñas")
//
// Me gusta: cambia al instante y vuelve atrás si Firestore falla.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAuthor } from '../hooks/useAuthor';
import { useDismiss } from '../hooks/useDismiss';
import { deletePost, getMyReactions, setLike, setRepost } from '../services/posts';
import { writeErrorMessage } from '../services/writes';
import { timeAgo } from '../utils/text';
import AlbumCover from './AlbumCover';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import LibraryButton from './LibraryButton';
import PostReplies from './PostReplies';
import ShareMenu from './ShareMenu';
import TopFiveShelf from './TopFiveShelf';
import VinylRating, { formatRating } from './VinylRating';
import './PostCard.css';

const ACTION_TEXT = {
  review: 'reseñó un disco',
  listened: 'marcó como escuchado',
  top5: 'actualizó su Top 5',
};

export default function PostCard({ post, reason, repostedBy, showFollow = false, readOnly = false }) {
  const { author } = useAuthor();
  const { showToast } = useToast();
  const isMine = post.uid === author.uid;
  const firstName = post.displayName?.split(' ')[0] ?? '';

  // ¿Ya le di me gusta / lo compartí? (se lee una vez por posteo)
  const [mine, setMine] = useState({ postId: null, liked: false, reposted: false });
  useEffect(() => {
    if (readOnly) return undefined;
    let cancelled = false;
    getMyReactions(post.id, author.uid)
      .then((reactions) => !cancelled && setMine({ postId: post.id, ...reactions }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [post.id, author.uid, readOnly]);

  // Me gusta "optimista": el número cambia al instante. Si el contador real cambia (llega de Firestore),
  // dejamos de sumar la diferencia local.
  const [likeState, setLikeState] = useState({ base: post.likeCount ?? 0, delta: 0 });
  if ((post.likeCount ?? 0) !== likeState.base) setLikeState({ base: post.likeCount ?? 0, delta: 0 });
  const likeAction = useAsyncAction((liked) => setLike(post.id, author.uid, liked));
  const repostAction = useAsyncAction((reposted) => setRepost(post, author, reposted));
  const deleteAction = useAsyncAction(() => deletePost(post.id));
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuOpen, closeMenu, menuRef);

  async function toggleLike() {
    const liked = !mine.liked;
    setMine((current) => ({ ...current, liked }));
    setLikeState((current) => ({ ...current, delta: current.delta + (liked ? 1 : -1) }));
    try {
      await likeAction.run(liked);
    } catch (error) {
      // Volvemos atrás y avisamos.
      setMine((current) => ({ ...current, liked: !liked }));
      setLikeState((current) => ({ ...current, delta: current.delta + (liked ? -1 : 1) }));
      showToast({ type: 'error', message: writeErrorMessage(error, 'No pudimos guardar tu me gusta.') });
    }
  }

  async function toggleRepost() {
    const reposted = !mine.reposted;
    try {
      await repostAction.run(reposted);
      setMine((current) => ({ ...current, reposted }));
      showToast({ type: 'success', message: reposted ? 'Lo compartiste en tu muro.' : 'Dejaste de compartirlo.' });
    } catch (error) {
      showToast({ type: 'error', message: writeErrorMessage(error) });
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    try {
      await deleteAction.run();
      showToast({ type: 'success', message: 'Borraste el posteo.' });
    } catch (error) {
      showToast({ type: 'error', message: writeErrorMessage(error) });
    }
  }

  const likeCount = likeState.base + likeState.delta;
  const album = post.album;
  const spotifyUrl = album?.spotifyUrl ?? (album ? `https://open.spotify.com/album/${album.albumId}` : null);

  return (
    <div className="post">
      {repostedBy && (
        <p className="post__reposted">
          <span aria-hidden="true">⟲</span> {repostedBy} compartió
        </p>
      )}
      {reason && <p className="post__reason">{reason}</p>}
      <article className="post__card">
        <header className="post__header">
          <Link to={`/u/${post.username}`} tabIndex={-1} aria-hidden="true">
            <Avatar name={post.displayName} photoURL={post.photoURL} size={44} colorful />
          </Link>
          <div className="post__who">
            <span>
              <Link to={`/u/${post.username}`} className="post__name">
                {post.displayName}
              </Link>{' '}
              {ACTION_TEXT[post.type]}
            </span>
            <span className="post__meta">
              @{post.username} · {timeAgo(post.createdAt)}
            </span>
          </div>
          {showFollow && !isMine && <FollowButton uid={post.uid} name={post.displayName} />}
          {isMine && !readOnly && (
            <div className="post__menu" ref={menuRef}>
              <button
                type="button"
                className="post__menu-button"
                aria-label="Opciones del posteo"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="post__menu-panel">
                  <button type="button" className="share-menu__item" disabled={deleteAction.pending} onClick={handleDelete}>
                    {deleteAction.pending ? 'Borrando…' : 'Borrar posteo'}
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {album && (
          <Link to={`/disco/${album.albumId}`} className={`post__album${post.type === 'listened' ? ' post__album--small' : ''}`}>
            <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="post__cover" />
            <span className="post__album-info">
              <span className="post__album-name">{album.name}</span>
              <span className="post__album-meta">{[album.artist, album.year].filter(Boolean).join(' · ')}</span>
              {post.type === 'review' && post.rating > 0 && (
                <span className="post__rating">
                  <VinylRating value={post.rating} readOnly size={18} label={`Puntaje de ${firstName}`} />
                  <span className="post__rating-number" aria-hidden="true">
                    {formatRating(post.rating)}
                  </span>
                </span>
              )}
            </span>
          </Link>
        )}

        {post.type === 'top5' && <TopFiveShelf albums={post.top5} compact />}

        {post.text && <p className="post__text">{post.text}</p>}

        {readOnly ? (
          album && (
            <footer className="post__actions">
              <span className="post__spacer" />
              <LibraryButton album={album} />
            </footer>
          )
        ) : (
          <footer className="post__actions">
            <button
              type="button"
              className={`post-action${mine.liked ? ' post-action--liked' : ''}`}
              aria-pressed={mine.liked}
              aria-label={`Me gusta · ${likeCount}`}
              disabled={likeAction.pending}
              onClick={toggleLike}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill={mine.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5 6.5 5c2.1 0 3.6 1.2 5.5 3.2C13.9 6.2 15.4 5 17.5 5c4 0 6 4 4 7.5C19 16.65 12 21 12 21z" />
              </svg>
              {likeCount}
            </button>
            <button
              type="button"
              className="post-action"
              aria-expanded={repliesOpen}
              onClick={() => setRepliesOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 5h16v11H9l-5 4z" />
              </svg>
              Responder · {post.replyCount ?? 0}
            </button>
            {post.type !== 'repost' && (
              <ShareMenu
                count={post.repostCount ?? 0}
                reposted={mine.reposted}
                pending={repostAction.pending}
                onRepost={toggleRepost}
                url={`${window.location.origin}/post/${post.id}`}
                title={album ? `${album.name} en ALBOOM` : 'ALBOOM'}
              />
            )}
            <span className="post__spacer" />
            {album && <LibraryButton album={album} />}
            {album && spotifyUrl && (
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="post__spotify">
                Spotify <span aria-hidden="true">↗</span>
              </a>
            )}
            {post.type === 'top5' && (
              <Link to={`/u/${post.username}`} className="post__spotify">
                Ver su perfil
              </Link>
            )}
          </footer>
        )}

        {repliesOpen && <PostReplies postId={post.id} authorFirstName={firstName} />}
      </article>
    </div>
  );
}
