import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const location = useLocation();
  const { userEmail, userCountry } = location.state || {};

  const [query, setQuery] = useState('');
  const [userWeather, setUserWeather] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries = response.data.map(country => country.name.common);
        setRecommendations(countries);
      } catch (error) {
        console.error('Error fetching country list:', error);
      }
    };

    const fetchUserWeather = async () => {
      if (userCountry) {
        try {
          const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
            params: {
              key: 'f6a6d0356d414f0986d80934242106',
              q: userCountry,
              aqi: 'no',
            },
          });
          setUserWeather(response.data);
        } catch (error) {
          console.error('Error fetching user country weather:', error);
        }
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:3000/get-favorites', {
          params: { email: userEmail }
        });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchCountries();
    fetchUserWeather();
    fetchFavorites();
  }, [userCountry, userEmail]);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
        params: {
          key: 'f6a6d0356d414f0986d80934242106',
          q: query,
          aqi: 'no',
        },
      });
      setWeather(response.data);
      setError(null);
      setShowRecommendations(false);
    } catch (error) {
      setError('Could not fetch weather data');
      setWeather(null);
      setShowRecommendations(false);
      console.error('Error fetching weather:', error);
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setShowRecommendations(true);
  };

  const handleRecommendationClick = (country) => {
    setQuery(country);
    setShowRecommendations(false);
  };

  const handleAddFavorite = async () => {
    if (!weather) return;

    try {
      const response = await axios.post('http://localhost:3000/add-favorite', { email: userEmail, country: weather.location.name });
      console.log('Response:', response);
      if (response.status === 200) {
        setFavorites([...favorites, weather.location.name]);
      } else {
        console.error('Failed to add favorite:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const filteredRecommendations = recommendations.filter(country =>
    country.toLowerCase().startsWith(query.toLowerCase())
  );

  const styles = {
    container: {
      display: 'flex',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Arial', sans-serif",
    },
    mainContent: {
      flex: 3,
      padding: '20px',
      textAlign: 'center',
    },
    header: {
      width: '100%',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '20px 0',
      marginBottom: '20px',
    },
    headerText: {
      margin: 0,
      fontSize: '24px',
    },
    form: {
      position: 'relative',
      marginBottom: '20px',
      textAlign: 'left',
    },
    input: {
      padding: '10px',
      fontSize: '16px',
      width: '70%',
      marginRight: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
    },
    recommendationList: {
      position: 'absolute',
      top: '50px',
      left: 0,
      right: 0,
      maxHeight: '200px',
      overflowY: 'auto',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '5px',
      listStyleType: 'none',
      padding: 0,
      margin: 0,
      zIndex: 1000,
    },
    recommendationItem: {
      padding: '10px',
      cursor: 'pointer',
      borderBottom: '1px solid #ccc',
    },
    weatherInfo: {
      textAlign: 'left',
      marginTop: '20px',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '5px',
    },
    weatherSection: {
      marginBottom: '20px',
    },
    error: {
      color: 'red',
    },
    favoriteButton: {
      marginTop: '10px',
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      backgroundColor: '#ffc107',
      color: 'black',
      border: 'none',
      borderRadius: '5px',
    },
    favoritesList: {
      textAlign: 'left',
      marginTop: '20px',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '5px',
      listStyleType: 'none',
    },
    weatherDetailsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sidebar: {
      flex: 1,
      backgroundColor: '#e9ecef',
      padding: '20px',
      borderRadius: '5px',
      marginLeft: '20px',
    },
    sidebarHeader: {
      marginBottom: '10px',
      fontSize: '20px',
      fontWeight: 'bold',
    },
    sidebarItem: {
      padding: '10px 0',
      borderBottom: '1px solid #ccc',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerText}>Welcome back, {userEmail}</h1>
        </div>
        {userCountry && (
          <>
            <h2>Weather Information for {userCountry}</h2>
            {userWeather ? (
              <div style={{ ...styles.weatherInfo, ...styles.weatherSection }}>
                <h3>Current Weather in {userWeather.location.name}</h3>
                <p>Temperature: {userWeather.current.temp_c}°C</p>
                <p>Condition: {userWeather.current.condition.text}</p>
                <p>Wind: {userWeather.current.wind_kph} kph</p>
                <img src={userWeather.current.condition.icon} alt={userWeather.current.condition.text} />
              </div>
            ) : (
              <p>Loading weather information...</p>
            )}
          </>
        )}
        <h1>Search for Country Weather</h1>
        <form style={styles.form} onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setShowRecommendations(true)}
            placeholder="Enter Country or State"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Search</button>
          {showRecommendations && query.length > 0 && filteredRecommendations.length > 0 && (
            <ul style={styles.recommendationList}>
              {filteredRecommendations.map((country, index) => (
                <li
                  key={index}
                  style={styles.recommendationItem}
                  onClick={() => handleRecommendationClick(country)}
                >
                  {country}
                </li>
              ))}
            </ul>
          )}
        </form>
        {error && <p style={styles.error}>{error}</p>}
        {weather && (
          <div style={styles.weatherInfo}>
            <div style={styles.weatherDetailsContainer}>
              <div>
                <h2>Weather in {weather.location.name}</h2>
                <p>Temperature: {weather.current.temp_c}°C</p>
                <p>Condition: {weather.current.condition.text}</p>
                <p>Wind: {weather.current.wind_kph} kph</p>
                <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
              </div>
              <button style={styles.favoriteButton} onClick={handleAddFavorite}>
                Add to Favorites
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Favorites</div>
        <ul style={styles.favoritesList}>
          {favorites.map((favorite, index) => (
            <li key={index} style={styles.sidebarItem}>{favorite}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
