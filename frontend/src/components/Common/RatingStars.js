import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import './RatingStars.css';

const RatingStars = ({ rating, setRating, editable = true }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="rating-stars">
      {[...Array(5)].map((star, i) => {
        const ratingValue = i + 1;

        return (
          <label key={i}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => editable && setRating(ratingValue)}
              disabled={!editable}
            />
            <FaStar
              className="star"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              size={24}
              onMouseEnter={() => editable && setHover(ratingValue)}
              onMouseLeave={() => editable && setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default RatingStars;