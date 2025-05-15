import React from 'react';

/**
 * 영화 정보 섹션 컴포넌트
 * @param {Object} props - 영화 객체
 */
const MovieInfo = ({ movie }) => {
  return (
    <div className="movie-info">
      <h1>{movie.title}</h1>
      <img src={movie.thumbnail_url} alt={movie.title} />
      <p>{movie.description}</p>

      <div className="ott-logos">
        {movie.ott_list?.map(ott => (
          <img
            key={ott.id}
            src={ott.logo_url}
            alt={ott.name}
            className="ott-logo"
          />
        ))}
      </div>
    </div>
  );
};

export default MovieInfo;