// React нужен для классического JSX transform (jsxRuntime: 'classic')
// @ts-ignore - React используется неявно через JSX
import React, { useState } from 'react';

interface BondAnalyzerWidgetProps {
  ticker?: string;
  // group?: string;
  // currency?: string;
}

export const BondAnalyzerWidget = ({ ticker }: BondAnalyzerWidgetProps) => {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div
      style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '8px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
        💰 Bond Analyzer
      </h3>

      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
        Тикер: {ticker || 'не выбран'}
      </p>

      <p style={{ margin: '0 0 16px 0', fontSize: '12px', opacity: 0.8 }}>
        Кликов: {clickCount}
      </p>

      <button
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={() => setClickCount(clickCount + 1)}
      >
        Увеличить счетчик
      </button>
    </div>
  );
};