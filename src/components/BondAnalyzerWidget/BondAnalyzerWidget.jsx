import React, { useState, useEffect } from 'react';
import "./style.css";


const BondAnalyzerWidget = ({ widget, ticker, group, currency }) => {
  const [bondData, setBondData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticker) {
      loadBondData(ticker);
    }
  }, [ticker]);

  const loadBondData = async (bondTicker) => {
    setLoading(true);
    try {
      // Здесь ваша логика анализа облигаций
      const data = await analyzeBond(bondTicker);
      setBondData(data);
    } catch (error) {
      console.error('Error loading bond data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBond = async (ticker) => {
    // Ваша существующая логика анализа
    return {
      name: `Облигация ${ticker}`,
      yield: '8.5%',
      risk: 'Низкий',
      maturity: '2025',
      price: '1050 руб'
    };
  };

  return (
    <div className="bond-analyzer-widget">
      <div className="widget-header">
        <h3>💰 EdickExt - Анализ облигаций</h3>
        {ticker && <span className="ticker-badge">{ticker}</span>}
      </div>
      
      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : bondData ? (
        <div className="bond-data">
          <div className="data-row">
            <span>Доходность:</span>
            <strong>{bondData.yield}</strong>
          </div>
          <div className="data-row">
            <span>Риск:</span>
            <span className={`risk ${bondData.risk.toLowerCase()}`}>
              {bondData.risk}
            </span>
          </div>
          <div className="data-row">
            <span>Погашение:</span>
            <span>{bondData.maturity}</span>
          </div>
          <div className="data-row">
            <span>Цена:</span>
            <strong>{bondData.price}</strong>
          </div>
        </div>
      ) : (
        <div className="no-data">
          <p>Выберите облигацию для анализа</p>
          <small>или введите тикер в поиск</small>
        </div>
      )}
    </div>
  );
};

export default BondAnalyzerWidget;