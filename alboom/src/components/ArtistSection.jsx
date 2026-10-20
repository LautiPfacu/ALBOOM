// "Sobre el artista": foto, nombre y más discos del artista en Spotify.

import { Link } from 'react-router-dom';
import { useArtist } from '../hooks/useArtist';
import AlbumCover from './AlbumCover';
import './ArtistSection.css';

export default function ArtistSection({ artistId, currentAlbumId, artistName }) {
  const { artist, albums, loading } = useArtist(artistId);
  // Sin repetir el disco que se está viendo, y como mucho 3.
  const moreAlbums = albums.filter((album) => album.id !== currentAlbumId).slice(0, 3);

  if (!artistId || loading || (!artist && moreAlbums.length === 0)) return null;

  const name = artist?.name ?? artistName;

  return (
    <section className="artist-section" aria-labelledby="artist-title">
      <div className="artist-section__who">
        {artist?.image ? (
          <img className="artist-section__photo" src={artist.image} alt={`Foto de ${name}`} loading="lazy" />
        ) : (
          <div className="artist-section__photo artist-section__photo--empty" aria-hidden="true">
            Foto de Spotify
          </div>
        )}
        <div className="artist-section__info">
          <span className="artist-section__label">Sobre el artista</span>
          <h2 id="artist-title" className="artist-section__name">
            {name}
          </h2>
          <span className="artist-section__sub">Más discos en Spotify</span>
        </div>
      </div>

      {moreAlbums.length > 0 && (
        <div className="artist-section__albums">
          <h3 className="artist-section__albums-title">Más de {name}</h3>
          <div className="artist-section__grid">
            {moreAlbums.map((album) => (
              <Link key={album.id} to={`/disco/${album.id}`} className="artist-section__album">
                <AlbumCover src={album.cover} name={album.name} artist={album.artist} className="artist-section__cover" />
                <span className="artist-section__album-info">
                  <span className="artist-section__album-name">{album.name}</span>
                  {album.year && <span className="artist-section__album-year">{album.year}</span>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
