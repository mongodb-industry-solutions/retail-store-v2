'use client';  
  
import React from 'react';  
import { useDispatch } from 'react-redux';  
import { setFeature } from '@/redux/slices/GlobalSlice';  
  
export default function DemoTiles() {  
  const dispatch = useDispatch();  
  
  const handleTileClick = (feature, url) => {  
    // First set feature in store (for current app instance)  
    dispatch(setFeature({ feature }));  
    // Then navigate with feature param  
    window.location.href = `${url}?feature=${feature}`;  
  };  
  
  const tiles = [  
    {  
      id: 'omnichannelOrdering',  
      title: 'Omnichannel Ordering',  
      description: 'Experience seamless ordering across all channels',  
      url: 'http://localhost:8080/cart',  
      icon: '🛒',  
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  
      color: '#fff'  
    },  
    {  
      id: 'receipts',  
      title: 'Digital Receipts',  
      description: 'View and manage your digital receipts',  
      url: '/cart',  
      icon: '📄',  
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',  
      color: '#fff'  
    },  
    {  
      id: 'chatbot',  
      title: 'AI Chatbot',  
      description: 'Get instant assistance from our AI assistant',  
      url: '/orders',  
      icon: '🤖',  
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',  
      color: '#fff'  
    }  
  ];  
  
  return (  
    <div style={styles.container}>  
      <div style={styles.header}>  
        <h1 style={styles.title}>🧪 Internal Demo Features</h1>  
        <p style={styles.subtitle}>Click on any tile to explore the feature</p>  
      </div>  
        
      <div style={styles.tilesContainer}>  
        {tiles.map((tile) => (  
          <div  
            key={tile.id}  
            style={{  
              ...styles.tile,  
              background: tile.gradient,  
              color: tile.color  
            }}  
            onClick={() => handleTileClick(tile.id, tile.url)}  
            onMouseEnter={(e) => {  
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';  
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';  
            }}  
            onMouseLeave={(e) => {  
              e.currentTarget.style.transform = 'translateY(0) scale(1)';  
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';  
            }}  
          >  
            <div style={styles.iconContainer}>  
              <span style={styles.icon}>{tile.icon}</span>  
            </div>  
            <h3 style={styles.tileTitle}>{tile.title}</h3>  
            <p style={styles.tileDescription}>{tile.description}</p>  
            <div style={styles.arrow}>→</div>  
          </div>  
        ))}  
      </div>  
        
      <div style={styles.footer}>  
        <p style={styles.footerText}>  
          💡 This is an internal testing environment  
        </p>  
      </div>  
    </div>  
  );  
}  
  
const styles = {  
  container: {  
    minHeight: '100vh',  
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',  
    padding: '40px 20px',  
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'  
  },  
  header: {  
    textAlign: 'center',  
    marginBottom: '50px'  
  },  
  title: {  
    fontSize: '2.5rem',  
    fontWeight: '700',  
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  
    WebkitBackgroundClip: 'text',  
    WebkitTextFillColor: 'transparent',  
    backgroundClip: 'text',  
    margin: '0 0 15px 0'  
  },  
  subtitle: {  
    fontSize: '1.1rem',  
    color: '#666',  
    margin: '0',  
    fontWeight: '400'  
  },  
  tilesContainer: {  
    display: 'flex',  
    gap: '30px',  
    maxWidth: '1200px',  
    margin: '0 auto',  
    flexWrap: 'wrap',  
    justifyContent: 'center'  
  },  
  tile: {  
    flex: '1',  
    minWidth: '280px',  
    maxWidth: '350px',  
    borderRadius: '20px',  
    padding: '40px 30px',  
    cursor: 'pointer',  
    textAlign: 'center',  
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',  
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',  
    position: 'relative',  
    overflow: 'hidden',  
    border: 'none'  
  },  
  iconContainer: {  
    marginBottom: '20px'  
  },  
  icon: {  
    fontSize: '3rem',  
    display: 'block',  
    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'  
  },  
  tileTitle: {  
    fontSize: '1.5rem',  
    fontWeight: '700',  
    margin: '0 0 15px 0',  
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'  
  },  
  tileDescription: {  
    fontSize: '1rem',  
    margin: '0 0 20px 0',  
    opacity: '0.9',  
    lineHeight: '1.5',  
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'  
  },  
  arrow: {  
    fontSize: '1.5rem',  
    fontWeight: 'bold',  
    opacity: '0.8',  
    transition: 'transform 0.3s ease'  
  },  
  footer: {  
    textAlign: 'center',  
    marginTop: '60px'  
  },  
  footerText: {  
    color: '#888',  
    fontSize: '0.9rem',  
    fontStyle: 'italic'  
  }  
};  
