import React from "react";

export const BondAnalyzerWidget: React.FC<any> = ({ ticker,
  // group, currency
}) => {
  const [clickCount, setClickCount] = React.useState(0);

  return React.createElement('div', {
    style: {
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '8px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }
  },
    React.createElement('h3', {
      style: { margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }
    }, '💰 Bond Analyzer'),

    React.createElement('p', {
      style: { margin: '0 0 8px 0', fontSize: '14px' }
    }, `Тикер: ${ticker || 'не выбран'}`),

    React.createElement('p', {
      style: { margin: '0 0 16px 0', fontSize: '12px', opacity: 0.8 }
    }, `Кликов: ${clickCount}`),

    React.createElement('button', {
      style: {
        marginTop: '16px',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px'
      },
      onClick: () => setClickCount(clickCount + 1)
    }, 'Увеличить счетчик')
  );
};