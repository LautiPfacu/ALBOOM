// Lista de posteos con carga infinita: cuando llegás al final, pide los siguientes 20.
//   <PostFeed posts={posts} loading hasMore loadMore error empty={<EmptyState …/>} />

import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ErrorState from './ErrorState';
import FeedItem from './FeedItem';
import Loader from './Loader';
import './PostFeed.css';

export default function PostFeed({ posts, loading, loadingMore = false, hasMore, loadMore, error, empty, showFollow }) {
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading && !loadingMore);

  if (loading) return <Loader size={64} label="Cargando posteos…" />;
  if (error) return <ErrorState message={error} />;
  if (posts.length === 0) return empty ?? null;

  return (
    <div className="post-feed">
      {posts.map((post) => (
        <FeedItem key={post.id} post={post} showFollow={showFollow} />
      ))}
      {/* Sentinel: cuando aparece en pantalla, se cargan más */}
      <div ref={sentinelRef} aria-hidden="true" />
      {loadingMore && <Loader size={64} label="Cargando más…" />}
    </div>
  );
}
