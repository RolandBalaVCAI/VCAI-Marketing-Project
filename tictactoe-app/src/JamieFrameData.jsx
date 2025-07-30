import { useState, useMemo } from 'react'

const JamieFrameData = () => {
  const [drinkLevel, setDrinkLevel] = useState(0)
  const [filterMode, setFilterMode] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMove, setSelectedMove] = useState(null)
  const [sortColumn, setSortColumn] = useState('input')
  const [sortDirection, setSortDirection] = useState('asc')

  const frameData = {
    normals: [
      { input: '5LP', damage: 270, startup: 5, active: 2, recovery: 6, total: 13, hitAdv: 5, blockAdv: 0, chAdv: 7, pcAdv: 7, drAdv: 4, guard: 'LH', cancel: 'Sp,SA', type: 'normal' },
      { input: '5MP', damage: 600, startup: 8, active: 4, recovery: 13, total: 25, hitAdv: 6, blockAdv: 2, chAdv: 8, pcAdv: 10, drAdv: 6, guard: 'LH', cancel: '', type: 'normal' },
      { input: '5HP', damage: 900, startup: 5, active: 3, recovery: 26, total: 34, hitAdv: 1, blockAdv: -3, chAdv: 'KD', pcAdv: 'Crumple +71', drAdv: 1, guard: 'LH', cancel: '', type: 'normal', notes: 'Crumple +71 on Punish Counter' },
      { input: '5LK', damage: 250, startup: 5, active: 3, recovery: 8, total: 16, hitAdv: 2, blockAdv: -2, chAdv: 4, pcAdv: 4, drAdv: 2, guard: 'LH', cancel: 'Sp,SA', type: 'normal', drinkNote: 'Frame data worsens above Drink Lv.1' },
      { input: '5MK', damage: 540, startup: 9, active: 3, recovery: 17, total: 29, hitAdv: 2, blockAdv: -2, chAdv: 4, pcAdv: 6, drAdv: 2, guard: 'LH', cancel: '', type: 'normal' },
      { input: '5HK', damage: 720, startup: 15, active: 3, recovery: 20, total: 38, hitAdv: 3, blockAdv: -7, chAdv: 'KD', pcAdv: 'KD', drAdv: -3, guard: 'LH', cancel: '', type: 'normal' },
      { input: '2LP', damage: 270, startup: 4, active: 2, recovery: 8, total: 14, hitAdv: 5, blockAdv: -1, chAdv: 7, pcAdv: 7, drAdv: 3, guard: 'LH', cancel: 'Sp,SA', type: 'normal', notes: 'Only 4f normal' },
      { input: '2MP', damage: 600, startup: 6, active: 3, recovery: 12, total: 21, hitAdv: 5, blockAdv: -1, chAdv: 7, pcAdv: 9, drAdv: 3, guard: 'LH', cancel: 'Sp,SA', type: 'normal' },
      { input: '2HP', damage: 900, startup: 8, active: 3, recovery: 24, total: 35, hitAdv: 0, blockAdv: -8, chAdv: 'Launch', pcAdv: 'Launch', drAdv: -4, guard: 'LH', cancel: 'V', type: 'normal', notes: 'Anti-air, launches' },
      { input: '2LK', damage: 200, startup: 5, active: 2, recovery: 9, total: 16, hitAdv: 3, blockAdv: -2, chAdv: 5, pcAdv: 5, drAdv: 2, guard: 'L', cancel: 'Sp,SA', type: 'normal', notes: 'Low' },
      { input: '2MK', damage: 500, startup: 7, active: 3, recovery: 15, total: 25, hitAdv: -1, blockAdv: -5, chAdv: 1, pcAdv: 3, drAdv: -1, guard: 'L', cancel: 'Sp,SA', type: 'normal', notes: 'Low' },
      { input: '2HK', damage: 900, startup: 11, active: 3, recovery: 25, total: 39, hitAdv: 'KD', blockAdv: -12, chAdv: 'KD', pcAdv: 'KD', drAdv: -8, guard: 'L', cancel: 'V', type: 'normal', notes: 'Low sweep' },
      { input: 'j.LP', damage: 270, startup: 4, active: 6, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'normal' },
      { input: 'j.MP', damage: 500, startup: 7, active: 5, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'normal' },
      { input: 'j.HP', damage: 800, startup: 10, active: 5, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'normal' },
      { input: 'j.LK', damage: 270, startup: 5, active: 7, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'normal' },
      { input: 'j.MK', damage: 500, startup: 8, active: 5, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'normal' },
      { input: 'j.HK', damage: 800, startup: 11, active: 5, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'normal' }
    ],
    commandNormals: [
      { input: '6HP', damage: 800, startup: 22, active: 3, recovery: 19, total: 43, hitAdv: 3, blockAdv: -2, chAdv: 'KD', pcAdv: 'KD', drAdv: 2, guard: 'LH', cancel: '', type: 'command', notes: 'Overhead' },
      { input: '6HK', damage: 800, startup: 26, active: 2, recovery: 20, total: 47, hitAdv: 4, blockAdv: -2, chAdv: 6, pcAdv: 8, drAdv: 2, guard: 'LH', cancel: '', type: 'command' },
      { input: '4HP', damage: 700, startup: 14, active: 3, recovery: 17, total: 33, hitAdv: 6, blockAdv: 0, chAdv: 8, pcAdv: 10, drAdv: 4, guard: 'LH', cancel: 'V', type: 'command' },
      { input: '4HK', damage: 900, startup: 13, active: 12, recovery: 17, total: 41, hitAdv: 2, blockAdv: -4, chAdv: 4, pcAdv: 6, drAdv: 0, guard: 'LH', cancel: '', type: 'command' },
      { input: 'j.2MK', damage: 700, startup: 10, active: 15, recovery: '', total: '', hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: 'OH', cancel: '', type: 'command', notes: 'Divekick' }
    ],
    targetCombos: [
      { input: '5MK > 5MP', damage: '600+600', startup: '9+11', active: '3+3', recovery: '', total: '', hitAdv: 5, blockAdv: -1, chAdv: 7, pcAdv: 9, drAdv: 3, guard: 'LH', cancel: 'SA', type: 'target', drinkRequired: 1 },
      { input: '5MK > 5MP > 5HP', damage: '600+600+800', startup: '9+11+14', active: '3+3+3', recovery: '', total: '', hitAdv: 'KD', blockAdv: -5, chAdv: 'KD', pcAdv: 'KD', drAdv: -1, guard: 'LH', cancel: '', type: 'target', drinkRequired: 2 },
      { input: '2HP > 2HP', damage: '800+600', startup: '10+13', active: '3+3', recovery: '', total: '', hitAdv: 'Launch', blockAdv: -11, chAdv: 'Launch', pcAdv: 'Launch', drAdv: -7, guard: 'LH', cancel: '', type: 'target', drinkRequired: 2 }
    ],
    specials: [
      { input: '236P', damage: 350, startup: 13, active: 2, recovery: 23, total: 38, hitAdv: -1, blockAdv: -6, chAdv: 1, pcAdv: 3, drAdv: -2, guard: 'LH', cancel: 'SA3', type: 'special', name: 'Freeflow Strikes', notes: 'Rekka - can follow up with 6P>6P' },
      { input: '22P', damage: 0, startup: 47, active: '', recovery: '', total: 73, hitAdv: '', blockAdv: '', chAdv: '', pcAdv: '', drAdv: '', guard: '', cancel: '', type: 'special', name: 'The Devil Inside (Drink)', notes: 'Gains 1 drink level, hold for more' },
      { input: '214P', damage: 700, startup: 17, active: '', recovery: '', total: 42, hitAdv: 'KD +39', blockAdv: '', chAdv: 'KD', pcAdv: 'KD', drAdv: '', guard: 'LH', cancel: '', type: 'special', name: 'Swagger Step', notes: 'Lunging palm strike' },
      { input: '623K', damage: 1000, startup: 5, active: 10, recovery: 37, total: 52, hitAdv: 'KD +34', blockAdv: -26, chAdv: 'KD', pcAdv: 'KD', drAdv: -22, guard: 'LH', cancel: '', type: 'special', name: 'Arrow Kick', drinkRequired: 1, notes: 'Anti-air launcher' },
      { input: 'j.214K', damage: 600, startup: 12, active: 8, recovery: 25, total: 45, hitAdv: 'KD +25', blockAdv: -10, chAdv: 'KD', pcAdv: 'KD', drAdv: -6, guard: 'OH', cancel: '', type: 'special', name: 'Luminous Dive Kick', drinkRequired: 1, notes: 'During forward jump only' },
      { input: '236K', damage: 800, startup: 14, active: 13, recovery: 15, total: 42, hitAdv: 'KD +30', blockAdv: -5, chAdv: 'KD', pcAdv: 'KD', drAdv: -1, guard: 'LH', cancel: '', type: 'special', name: 'Bakkai', drinkRequired: 2, notes: 'Sliding kicks' },
      { input: '63214K', damage: 1200, startup: 5, active: '', recovery: '', total: 38, hitAdv: 'KD +45', blockAdv: '', chAdv: 'KD', pcAdv: 'KD', drAdv: '', guard: 'Throw', cancel: '', type: 'special', name: 'Tenshin', drinkRequired: 3, notes: 'Command throw' }
    ],
    supers: [
      { input: '236236K', damage: 2000, startup: 10, active: '', recovery: 64, total: 74, hitAdv: 'KD +7', blockAdv: -22, chAdv: 'KD', pcAdv: 'KD', drAdv: -18, guard: 'LH', cancel: '', type: 'super', name: 'Breakin SA1', notes: 'Strike/throw invincible, breaks armor' },
      { input: '214214P', damage: 2000, startup: 11, active: '', recovery: '', total: '', hitAdv: 'KD', blockAdv: -5, chAdv: 'KD', pcAdv: 'KD', drAdv: -1, guard: 'LH', cancel: '', type: 'super', name: 'The Devils Song SA2', notes: 'Temporarily enables 4 drinks' },
      { input: '236236P', damage: 2500, startup: 10, active: '', recovery: 32, total: 42, hitAdv: 'KD +71', blockAdv: -60, chAdv: 'KD', pcAdv: 'KD', drAdv: -56, guard: 'LH', cancel: '', type: 'super', name: 'Getsuga Saiho SA3', notes: 'Fully invincible f1-11, breaks armor' }
    ]
  }

  const allMoves = useMemo(() => {
    const moves = [
      ...frameData.normals,
      ...frameData.commandNormals,
      ...frameData.targetCombos,
      ...frameData.specials,
      ...frameData.supers
    ]

    return moves.filter(move => {
      if (move.drinkRequired && move.drinkRequired > drinkLevel) {
        return false
      }
      return true
    })
  }, [drinkLevel])

  const filteredMoves = useMemo(() => {
    let filtered = [...allMoves]

    if (searchTerm) {
      filtered = filtered.filter(move => 
        move.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (move.name && move.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (move.notes && move.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    switch (filterMode) {
      case 'safe':
        filtered = filtered.filter(move => move.blockAdv >= -3)
        break
      case 'punishable':
        filtered = filtered.filter(move => move.blockAdv < -3)
        break
      case 'plus':
        filtered = filtered.filter(move => move.blockAdv > 0)
        break
      case 'launcher':
        filtered = filtered.filter(move => 
          move.hitAdv === 'Launch' || move.hitAdv === 'KD' || 
          (move.notes && move.notes.includes('Launch'))
        )
        break
      case 'cancelable':
        filtered = filtered.filter(move => move.cancel && move.cancel.length > 0)
        break
      case 'combostarter':
        filtered = filtered.filter(move => {
          if (typeof move.hitAdv === 'number' && move.hitAdv >= 5) return true
          if (move.hitAdv === 'Launch' || move.hitAdv === 'KD') return true
          if (move.cancel && move.cancel.includes('Sp')) return true
          return false
        })
        break
    }

    filtered.sort((a, b) => {
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      aVal = String(aVal || '')
      bVal = String(bVal || '')
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    })

    return filtered
  }, [allMoves, searchTerm, filterMode, sortColumn, sortDirection])

  const findCombos = (move) => {
    if (!move || typeof move.hitAdv !== 'number') return []
    
    const combos = allMoves.filter(followUp => {
      if (!followUp.startup || typeof followUp.startup !== 'number') return false
      return followUp.startup <= move.hitAdv + 3
    })
    
    return combos
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getAdvantageColor = (advantage) => {
    if (typeof advantage !== 'number') return '#666'
    if (advantage >= 0) return '#22c55e'
    if (advantage >= -3) return '#eab308'
    return '#ef4444'
  }

  const containerStyle = {
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '1600px',
    margin: '0 auto',
    backgroundColor: '#0f0f0f',
    color: '#ffffff',
    minHeight: '100vh'
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333'
  }

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }

  const subtitleStyle = {
    fontSize: '1.1rem',
    color: '#a0a0a0',
    margin: 0,
    fontWeight: '400'
  }

  const controlsStyle = {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333'
  }

  const drinkSelectorStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }

  const drinkLabelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e0e0e0',
    marginRight: '12px'
  }

  const drinkButtonStyle = (level) => ({
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: drinkLevel === level ? '#667eea' : '#2a2a2a',
    color: '#fff',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    boxShadow: drinkLevel === level ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
  })

  const filterButtonStyle = (mode) => ({
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: filterMode === mode ? '#667eea' : '#2a2a2a',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: filterMode === mode ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
  })

  const searchStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
    width: '240px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  }

  const tableContainerStyle = {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #333',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  }

  const thStyle = {
    padding: '16px 12px',
    backgroundColor: '#2a2a2a',
    textAlign: 'left',
    fontWeight: '600',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid #333',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#e0e0e0',
    transition: 'background-color 0.2s ease'
  }

  const thHoverStyle = {
    ...thStyle,
    backgroundColor: '#333'
  }

  const tdStyle = {
    padding: '14px 12px',
    borderBottom: '1px solid #333',
    fontSize: '14px',
    fontWeight: '400'
  }

  const moveDetailsStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    zIndex: 1000,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
    backdropFilter: 'blur(4px)'
  }

  const statsStyle = {
    fontSize: '14px',
    color: '#a0a0a0',
    marginBottom: '16px'
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Jamie Frame Data Analyzer</h1>
        <p style={subtitleStyle}>Street Fighter 6 - Comprehensive Frame Data Tool</p>
        <p style={{ fontSize: '0.9rem', color: '#666', margin: '8px 0 0 0', fontStyle: 'italic' }}>
          Data from Street Fighter 6 Version 06.04.2025 (June 2025 Patch)
        </p>
      </header>

      <div style={controlsStyle}>
        <div style={drinkSelectorStyle}>
          <span style={drinkLabelStyle}>Drink Level:</span>
          {[0, 1, 2, 3, 4].map(level => (
            <button
              key={level}
              style={drinkButtonStyle(level)}
              onClick={() => setDrinkLevel(level)}
            >
              {level} {level === 1 ? 'Drink' : 'Drinks'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search moves..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchStyle}
        />
      </div>

      <div style={{ ...controlsStyle, marginTop: '0' }}>
        <span style={drinkLabelStyle}>Filter:</span>
        <button style={filterButtonStyle('all')} onClick={() => setFilterMode('all')}>
          All Moves
        </button>
        <button style={filterButtonStyle('safe')} onClick={() => setFilterMode('safe')}>
          Safe on Block (-3 or better)
        </button>
        <button style={filterButtonStyle('punishable')} onClick={() => setFilterMode('punishable')}>
          Punishable
        </button>
        <button style={filterButtonStyle('plus')} onClick={() => setFilterMode('plus')}>
          Plus on Block
        </button>
        <button style={filterButtonStyle('launcher')} onClick={() => setFilterMode('launcher')}>
          Launchers/Knockdowns
        </button>
        <button style={filterButtonStyle('cancelable')} onClick={() => setFilterMode('cancelable')}>
          Cancelable
        </button>
        <button style={filterButtonStyle('combostarter')} onClick={() => setFilterMode('combostarter')}>
          Combo Starters
        </button>
      </div>

      <div style={statsStyle}>
        Found {filteredMoves.length} moves
      </div>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} onClick={() => handleSort('input')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              Input {sortColumn === 'input' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('name')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('damage')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              Damage {sortColumn === 'damage' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('startup')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              Startup {sortColumn === 'startup' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('blockAdv')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              On Block {sortColumn === 'blockAdv' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('hitAdv')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              On Hit {sortColumn === 'hitAdv' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('chAdv')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              CH {sortColumn === 'chAdv' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('pcAdv')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              PC {sortColumn === 'pcAdv' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle} onClick={() => handleSort('drAdv')} onMouseEnter={(e) => e.target.style.backgroundColor = '#333'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}>
              DR {sortColumn === 'drAdv' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={thStyle}>Cancel</th>
            <th style={thStyle}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredMoves.map((move, index) => (
            <tr 
              key={index} 
              style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
              onClick={() => setSelectedMove(move)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={tdStyle}>{move.input}</td>
              <td style={tdStyle}>{move.name || move.type}</td>
              <td style={tdStyle}>{move.damage}</td>
              <td style={tdStyle}>{move.startup}</td>
              <td style={{ ...tdStyle, color: getAdvantageColor(move.blockAdv), fontWeight: 'bold' }}>
                {move.blockAdv}
              </td>
              <td style={{ ...tdStyle, color: typeof move.hitAdv === 'number' ? '#22c55e' : '#fbbf24' }}>
                {move.hitAdv}
              </td>
              <td style={{ ...tdStyle, color: typeof move.chAdv === 'number' ? getAdvantageColor(move.chAdv) : '#fbbf24' }}>
                {move.chAdv || '-'}
              </td>
              <td style={{ ...tdStyle, color: typeof move.pcAdv === 'number' ? getAdvantageColor(move.pcAdv) : '#fbbf24' }}>
                {move.pcAdv || '-'}
              </td>
              <td style={{ ...tdStyle, color: typeof move.drAdv === 'number' ? getAdvantageColor(move.drAdv) : '#666' }}>
                {move.drAdv || '-'}
              </td>
              <td style={tdStyle}>{move.cancel || '-'}</td>
              <td style={tdStyle}>
                {move.drinkRequired && (
                  <span style={{ color: '#3b82f6', marginRight: '8px' }}>
                    Lv.{move.drinkRequired}+
                  </span>
                )}
                {move.notes}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {selectedMove && (
        <>
          <div style={overlayStyle} onClick={() => setSelectedMove(null)} />
          <div style={moveDetailsStyle}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>
              {selectedMove.input} - {selectedMove.name || selectedMove.type}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Damage:</strong> {selectedMove.damage}</p>
                <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Startup:</strong> {selectedMove.startup} frames</p>
                {selectedMove.active && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Active:</strong> {selectedMove.active} frames</p>}
                {selectedMove.recovery && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Recovery:</strong> {selectedMove.recovery} frames</p>}
                {selectedMove.guard && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Guard:</strong> {selectedMove.guard}</p>}
              </div>
              <div>
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>On Block:</strong>{' '}
                  <span style={{ color: getAdvantageColor(selectedMove.blockAdv), fontWeight: '600' }}>
                    {selectedMove.blockAdv}
                  </span>
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>On Hit:</strong> <span style={{ color: typeof selectedMove.hitAdv === 'number' ? '#22c55e' : '#fbbf24', fontWeight: '600' }}>{selectedMove.hitAdv}</span></p>
                {selectedMove.chAdv && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Counter Hit:</strong> <span style={{ color: typeof selectedMove.chAdv === 'number' ? getAdvantageColor(selectedMove.chAdv) : '#fbbf24', fontWeight: '600' }}>{selectedMove.chAdv}</span></p>}
                {selectedMove.pcAdv && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Punish Counter:</strong> <span style={{ color: typeof selectedMove.pcAdv === 'number' ? getAdvantageColor(selectedMove.pcAdv) : '#fbbf24', fontWeight: '600' }}>{selectedMove.pcAdv}</span></p>}
                {selectedMove.drAdv && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Drive Rush:</strong> <span style={{ color: typeof selectedMove.drAdv === 'number' ? getAdvantageColor(selectedMove.drAdv) : '#666', fontWeight: '600' }}>{selectedMove.drAdv}</span></p>}
              </div>
            </div>
            {selectedMove.cancel && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Cancel Options:</strong> {selectedMove.cancel}</p>}
            {selectedMove.drinkRequired && (
              <p style={{ color: '#667eea', margin: '8px 0', fontSize: '14px' }}>
                <strong>Requires:</strong> {selectedMove.drinkRequired} Drink(s)
              </p>
            )}
            {selectedMove.notes && <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Notes:</strong> {selectedMove.notes}</p>}
            
            {typeof selectedMove.hitAdv === 'number' && selectedMove.hitAdv > 0 && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#fff' }}>Possible Follow-ups:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {findCombos(selectedMove).slice(0, 5).map((combo, i) => (
                    <li key={i} style={{ marginBottom: '6px', fontSize: '14px', color: '#e0e0e0' }}>
                      <span style={{ fontWeight: '500', color: '#667eea' }}>{combo.input}</span> (Startup: {combo.startup}f)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: '#667eea',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setSelectedMove(null)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default JamieFrameData