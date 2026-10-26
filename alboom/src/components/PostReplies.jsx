// Hilo de respuestas debajo de un posteo: 2 respuestas + "Ver N más" + campo para responder.

import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAuthor } from '../hooks/useAuthor';
import { useReplies } from '../hooks/useReplies';
import { addReply, REPLY_MAX_LENGTH } from '../services/posts';
import { writeErrorMessage } from '../services/writes';
import { timeAgo } from '../utils/text';
import Avatar from './Avatar';
import Button from './Button';
import Loader from './Loader';
import { useRequireAccount } from '../hooks/useRequireAccount';
import { useT } from '../i18n/LanguageContext';
import './PostReplies.css';

const FIRST_REPLIES = 2;

export default function PostReplies({ postId, authorFirstName }) {
  const requireAccount = useRequireAccount();
  const t = useT();
  const { author } = useAuthor();
  const { showToast } = useToast();
  const { replies, loading, error } = useReplies(postId, true);
  const [showAll, setShowAll] = useState(false);
  const [text, setText] = useState('');
  const inputId = useId();
  const { run, pending } = useAsyncAction(() => addReply(postId, author, text));

  const visible = showAll ? replies : replies.slice(0, FIRST_REPLIES);
  const hidden = replies.length - visible.length;

  async function handleSubmit(event) {
    event.preventDefault();
    if (requireAccount()) return;
    if (!text.trim()) return;
    try {
      // RESPONDER: se limpia el campo recién cuando Firestore confirma.
      await run();
      setText('');
    } catch (replyError) {
      showToast({ type: 'error', message: writeErrorMessage(replyError, 'No pudimos publicar tu respuesta.') });
    }
  }

  return (
    <div className="post-replies">
      {loading && <Loader size={32} />}
      {error && <p className="dialog__error">{t(error)}</p>}
      {visible.map((reply) => (
        <div key={reply.id} className="post-replies__item">
          <Avatar name={reply.displayName} photoURL={reply.photoURL} size={30} colorful />
          <div className="post-replies__body">
            <span className="post-replies__meta">
              <Link to={`/u/${reply.username}`} className="post-replies__name">
                {reply.displayName}
              </Link>{' '}
              @{reply.username} · {timeAgo(reply.createdAt)}
            </span>
            <p className="post-replies__text">{reply.text}</p>
          </div>
        </div>
      ))}
      {hidden > 0 && (
        <button type="button" className="text-link post-replies__more" onClick={() => setShowAll(true)}>
          {hidden === 1 ? t('Ver 1 respuesta más') : t('Ver {n} respuestas más', { n: hidden })}
        </button>
      )}
      <form className="post-replies__form" onSubmit={handleSubmit}>
        <Avatar name={author.displayName} photoURL={author.photoURL} size={30} />
        <label htmlFor={inputId} className="visually-hidden">
          {t('Responder')}
        </label>
        <input
          id={inputId}
          className="post-replies__input"
          value={text}
          maxLength={REPLY_MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('Respondé a {name}…', { name: authorFirstName })}
          autoComplete="off"
        />
        <Button type="submit" size="sm" pending={pending} disabled={!text.trim()}>
          {pending ? 'Enviando…' : 'Responder'}
        </Button>
      </form>
    </div>
  );
}
