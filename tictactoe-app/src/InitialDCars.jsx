import React from 'react';

const InitialDCars = () => {
  const cars = [
    {
      id: 1,
      name: "Toyota Sprinter Trueno AE86",
      driver: "Takumi Fujiwara",
      team: "Project D / Fujiwara Tofu Shop",
      engine: "4A-GEU (later 4A-GE Group A)",
      drivetrain: "FR",
      appearance: "Episode 1",
      description: "The iconic protagonist car, known for its tofu delivery runs and exceptional downhill performance.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Toyota+AE86+Trueno"
    },
    {
      id: 2,
      name: "Mazda RX-7 FC3S",
      driver: "Ryosuke Takahashi",
      team: "RedSuns / Project D",
      engine: "13B-T Rotary",
      drivetrain: "FR",
      appearance: "Episode 1",
      description: "The White Comet of Akagi, known for its theoretical driving approach and rotary power.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Mazda+RX-7+FC3S"
    },
    {
      id: 3,
      name: "Mazda RX-7 FD3S",
      driver: "Keisuke Takahashi",
      team: "RedSuns / Project D",
      engine: "13B-REW Twin Turbo Rotary",
      drivetrain: "FR",
      appearance: "Episode 1",
      description: "Yellow FD driven by Ryosuke's younger brother, known for aggressive driving style.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Mazda+RX-7+FD3S"
    },
    {
      id: 4,
      name: "Nissan Skyline GT-R R32",
      driver: "Takeshi Nakazato",
      team: "Myogi NightKids",
      engine: "RB26DETT Twin Turbo",
      drivetrain: "AWD",
      appearance: "Episode 2",
      description: "Black R32 known for its grip racing style and unfortunate tendency to crash.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Nissan+Skyline+R32"
    },
    {
      id: 5,
      name: "Nissan Sileighty",
      driver: "Mako Sato & Sayuki",
      team: "Impact Blue",
      engine: "CA18DET Turbo",
      drivetrain: "FR",
      appearance: "Episode 5",
      description: "Unique Silvia front-end with 180SX body, driven by Usui Pass's fastest duo.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Nissan+Sileighty"
    },
    {
      id: 6,
      name: "Mitsubishi Lancer Evolution III",
      driver: "Kyoichi Sudo",
      team: "Emperor",
      engine: "4G63T Turbo",
      drivetrain: "AWD",
      appearance: "Episode 9",
      description: "AWD monster that dominated using its superior traction and rally heritage.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Lancer+Evolution+III"
    },
    {
      id: 7,
      name: "Honda Civic Type R EK9",
      driver: "Shingo Shoji",
      team: "Myogi NightKids",
      engine: "B16B VTEC",
      drivetrain: "FF",
      appearance: "Episode 14",
      description: "Red Civic notorious for its dangerous bumper-tap technique and gum tape deathmatch.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Honda+Civic+Type+R"
    },
    {
      id: 8,
      name: "Toyota MR2 SW20",
      driver: "Kai Kogashiwa",
      team: "Team Seven Star Leaf",
      engine: "3S-GTE Turbo",
      drivetrain: "MR",
      appearance: "Second Stage",
      description: "Mid-engine layout provides unique handling characteristics and challenge.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Toyota+MR2"
    },
    {
      id: 9,
      name: "Honda S2000 AP1",
      driver: "Toshiya Joshima",
      team: "Purple Shadow",
      engine: "F20C VTEC",
      drivetrain: "FR",
      appearance: "Fourth Stage",
      description: "High-revving roadster known as the 'God Hand' for its precise control.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Honda+S2000"
    },
    {
      id: 10,
      name: "Mazda RX-8",
      driver: "Ryuji Ikeda",
      team: "Project D",
      engine: "13B-MSP Renesis Rotary",
      drivetrain: "FR",
      appearance: "Fifth Stage",
      description: "Downhill specialist recruited by Project D for his exceptional skill.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Mazda+RX-8"
    },
    {
      id: 11,
      name: "Subaru Impreza WRX STI GC8",
      driver: "Bunta Fujiwara",
      team: "None",
      engine: "EJ20 Turbo",
      drivetrain: "AWD",
      appearance: "Second Stage",
      description: "Takumi's father's rally-bred machine, showcasing true driving mastery.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Subaru+Impreza+WRX"
    },
    {
      id: 12,
      name: "Toyota Celica GT-Four ST205",
      driver: "Miki",
      team: "None",
      engine: "3S-GTE Turbo",
      drivetrain: "AWD",
      appearance: "Extra Stage",
      description: "Rally homologation special with advanced AWD system and turbo power.",
      image: "https://via.placeholder.com/400x250/f8f8f8/333?text=Toyota+Celica+GT-Four"
    }
  ];

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333',
        fontSize: '2.5rem',
        marginBottom: '10px'
      }}>
        Initial D Cars
      </h1>
      <p style={{ 
        textAlign: 'center', 
        color: '#666',
        fontSize: '1.2rem',
        marginBottom: '40px'
      }}>
        In Order of Appearance
      </p>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {cars.map((car) => (
          <div 
            key={car.id} 
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              width: '100%',
              height: '250px',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={car.image} 
                alt={car.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="color: #999; font-size: 14px;">Image not available</div>';
                }}
              />
            </div>
            
            <div style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <h2 style={{ 
                  color: '#2c3e50', 
                  margin: '0',
                  fontSize: '1.5rem'
                }}>
                  {car.name}
                </h2>
                <span style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {car.appearance}
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#7f8c8d' }}>Driver:</strong>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{car.driver}</p>
                </div>
                <div>
                  <strong style={{ color: '#7f8c8d' }}>Team:</strong>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{car.team}</p>
                </div>
                <div>
                  <strong style={{ color: '#7f8c8d' }}>Engine:</strong>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{car.engine}</p>
                </div>
                <div>
                  <strong style={{ color: '#7f8c8d' }}>Drivetrain:</strong>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{car.drivetrain}</p>
                </div>
              </div>
              
              <p style={{ 
                color: '#555',
                lineHeight: '1.6',
                margin: '0'
              }}>
                {car.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <footer style={{
        textAlign: 'center',
        marginTop: '60px',
        padding: '20px',
        color: '#7f8c8d',
        fontSize: '0.9rem'
      }}>
        <p>Cars listed in order of their first appearance in the Initial D anime/manga series.</p>
      </footer>
    </div>
  );
};

export default InitialDCars;