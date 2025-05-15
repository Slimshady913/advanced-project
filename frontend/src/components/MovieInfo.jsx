import React from 'react';

/**
 * 영화 정보 섹션 컴포넌트
 * @param {Object} props - 영화 객체
 */
const MovieInfo = ({ movie }) => {
  if (!movie) return null; // movie가 없는 경우 아무것도 렌더링하지 않음

  return (
    <section className="movie-info">
      <h1 className="movie-title">{movie.title}</h1>

      <img
        src={movie.thumbnail_url}
        alt={`${movie.title} 포스터`}
        className="movie-thumbnail"
      />

      <p className="movie-description">{movie.description}</p>

      {movie.ott_list?.length > 0 && (
        <div className="ott-logos">
          {movie.ott_list.map((ott) => (
            <img
              key={ott.id}
              src={ott.logo_url}
              alt={ott.name}
              className="ott-logo"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MovieInfo;