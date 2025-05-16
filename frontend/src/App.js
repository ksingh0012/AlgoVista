import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('');
  const [processes, setProcesses] = useState([{ name: 'P1', arrival_time: 0, burst_time: 0 }]);
  const [timeQuanta, setTimeQuanta] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [compareResults, setCompareResults] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [viewingAlgo, setViewingAlgo] = useState(null);
  
  const animationRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/algorithms')
      .then(res => {
        setAlgorithms(res.data.algorithms);
        if (res.data.algorithms.length > 0) {
          setSelectedAlgo(res.data.algorithms[0]);
        }
      })
      .catch(() => setError('Failed to fetch algorithms'));
  }, []);

  useEffect(() => {
    if (isPlaying && result) {
      const lastTime = result.gantt_chart[result.gantt_chart.length - 1].end_time;
      
      if (currentTime >= lastTime) {
        setIsPlaying(false);
        return;
      }
      
      animationRef.current = setTimeout(() => {
        setCurrentTime(prevTime => Math.min(prevTime + 0.1, lastTime));
      }, 100);
      
      return () => {
        if (animationRef.current) clearTimeout(animationRef.current);
      };
    }
  }, [isPlaying, currentTime, result]);

  const handleProcessChange = (index, field, value) => {
    const newProcesses = [...processes];
    newProcesses[index][field] = field === 'name' ? value : Number(value);
    setProcesses(newProcesses);
  };

  const addProcess = () => {
    setProcesses([...processes, { name: `P${processes.length + 1}`, arrival_time: 0, burst_time: 4 }]);
  };

  const removeProcess = (index) => {
    if (processes.length === 1) return;
    const newProcesses = processes.filter((_, i) => i !== index);
    setProcesses(newProcesses);
  };

  const runSchedule = () => {
    setError('');
    setResult(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowComparison(false);

    const payload = {
      algorithm: selectedAlgo,
      processes,
    };
    if (selectedAlgo === 'Round Robin') {
      payload.time_quanta = timeQuanta;
    }

    axios.post('http://localhost:5000/schedule', payload)
      .then(res => {
        setResult(res.data);
        setIsPlaying(true);
      })
      .catch(err => setError(err.response?.data?.error || 'Error running schedule'));
  };

  const runAllAlgorithms = async () => {
    setError('');
    setResult(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowComparison(true);
    
    try {
      const results = {};
      const basePayload = {
        processes: processes.map(p => ({
          name: p.name,
          arrival_time: Number(p.arrival_time),
          burst_time: Number(p.burst_time),
          priority: Number(p.priority || 0)
        }))
      };

      for (const algo of algorithms) {
        const payload = {
          ...basePayload,
          algorithm: algo
        };
        
        if (algo === 'Round Robin') {
          payload.time_quanta = Number(timeQuanta);
        }
        
        try {
          const response = await axios.post('http://localhost:5000/schedule', payload);
          results[algo] = response.data;
        } catch (err) {
          setError(`Error running ${algo}: ${err.response?.data?.error || 'Unknown error'}`);
          return;
        }
      }
      
      if (Object.keys(results).length > 0) {
        setCompareResults(results);
      } else {
        setError('No results were generated from the algorithms');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error running comparison');
      setShowComparison(false);
    }
  };

  const togglePlayPause = () => {
    if (!result) return;
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const getProcessColor = (processName) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', 
      '#FB5607', '#8338EC', '#3A86FF', '#38B000'
    ];
    
    if (processName === 'idle') return '#CCCCCC';
    
    const processNumber = parseInt(processName.replace(/\D/g, ''), 10) || 0;
    return colors[processNumber % colors.length];
  };

  const ErrorMessage = ({ message, onClose }) => (
    <div className="error-message">
      <span>{message}</span>
      {onClose && (
        <button className="error-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );

  const viewAlgorithmDetails = (algo, data) => {
    setViewingAlgo(algo);
    setSelectedAlgo(algo);
    setResult(data);
    setShowComparison(false);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const backToComparison = () => {
    setViewingAlgo(null);
    setResult(null);
    setShowComparison(true);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">AlgoVista</h1>

      {/* Controls Section */}
      <div className="card">
        <div className="controls-container">
          <div className="control-group">
            <label className="control-label">Algorithm</label>
            <select 
              className="control-select"
              value={selectedAlgo} 
              onChange={e => setSelectedAlgo(e.target.value)}
            >
              {algorithms.map(algo => (
                <option key={algo} value={algo}>{algo}</option>
              ))}
            </select>
          </div>

          {selectedAlgo === 'Round Robin' && (
            <div className="control-group">
              <label className="control-label">Time Quantum</label>
              <input
                type="number"
                className="control-input"
                value={timeQuanta}
                min={1}
                onChange={e => setTimeQuanta(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={runSchedule}
          >
            Run Selected Algorithm
          </button>
          <button 
            className="btn btn-secondary"
            onClick={runAllAlgorithms}
          >
            Compare All Algorithms
          </button>
          {result && (
            <>
              <button 
                className={`btn ${isPlaying ? 'btn-warning' : 'btn-success'}`}
                onClick={togglePlayPause}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button 
                className="btn btn-gray"
                onClick={resetAnimation}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Processes Section */}
      <div className="card processes-section">
        <h2 className="processes-header">Processes</h2>
        
        <div className="process-grid-container">
          <div className="process-grid-header">
            <div>Name</div>
            <div>Arrival Time</div>
            <div>Burst Time</div>
            <div>Priority</div>
            <div></div>
          </div>

          {processes.map((proc, idx) => (
            <div key={idx} className="process-row">
              <input
                type="text"
                className="process-input"
                value={proc.name}
                onChange={e => handleProcessChange(idx, 'name', e.target.value)}
              />
              <input
                type="number"
                className="process-input"
                value={proc.arrival_time}
                min={0}
                onChange={e => handleProcessChange(idx, 'arrival_time', e.target.value)}
              />
              <input
                type="number"
                className="process-input"
                value={proc.burst_time}
                min={1}
                onChange={e => handleProcessChange(idx, 'burst_time', e.target.value)}
              />
              <div className="priority-input-container">
                <input
                  type="number"
                  className="process-input priority-input"
                  value={proc.priority || 0}
                  min={0}
                  onChange={e => handleProcessChange(idx, 'priority', e.target.value)}
                />
              </div>
              <button 
                className="btn-remove"
                onClick={() => removeProcess(idx)}
                disabled={processes.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button 
            className="btn-add-process"
            onClick={addProcess}
          >
            Add Process
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {!showComparison && result && (
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Gantt Chart ({selectedAlgo})</h2>
            {compareResults && (
              <button 
                className="btn btn-secondary"
                onClick={backToComparison}
              >
                Back to Comparison
              </button>
            )}
          </div>
          
          {/* Gantt Chart */}
          <div className="gantt-container">
            <div className="gantt-chart">
              {result.gantt_chart.map((entry, index) => {
                const startTime = Number(entry.start_time || entry.start).toFixed(1);
                const endTime = Number(entry.end_time || entry.end).toFixed(1);
                const duration = (Number(endTime) - Number(startTime)).toFixed(1);
                
                return (
                  <div 
                    key={index} 
                    className="gantt-block"
                    style={{
                      width: `${Number(duration) * 50}px`,
                      backgroundColor: getProcessColor(entry.name || entry.process_id)
                    }}
                  >
                    <div className="gantt-block-title">
                      {entry.name || entry.process_id}
                    </div>
                    <div className="gantt-block-time">
                      Start: {startTime}
                    </div>
                    <div className="gantt-block-time">
                      End: {endTime}
                    </div>
                    <div className="gantt-block-time">
                      Duration: {duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frame by Frame View */}
          <h3 className="section-title">Frame by Frame View</h3>
          <div className="frame-grid">
            {result.gantt_chart.map((entry, index) => (
              <div key={index} className="frame-card">
                <div 
                  className="frame-process"
                  style={{
                    backgroundColor: getProcessColor(entry.name || entry.process_id)
                  }}
                >
                  {entry.name || entry.process_id}
                </div>
                <div className="frame-details">
                  <div>Start Time:</div>
                  <div>{typeof entry.start_time === 'number' ? entry.start_time.toFixed(1) : 
                       typeof entry.start === 'number' ? entry.start.toFixed(1) : '-'}</div>
                  <div>End Time:</div>
                  <div>{typeof entry.end_time === 'number' ? entry.end_time.toFixed(1) : 
                       typeof entry.end === 'number' ? entry.end.toFixed(1) : '-'}</div>
                  <div>Duration:</div>
                  <div>{(typeof entry.end_time === 'number' && typeof entry.start_time === 'number') ? 
                        (entry.end_time - entry.start_time).toFixed(1) :
                       (typeof entry.end === 'number' && typeof entry.start === 'number') ?
                        (entry.end - entry.start).toFixed(1) : '-'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Process Table */}
          <h2 className="section-title">Process Table</h2>
          <div className="table-container">
            <table className="process-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  <th>Start Time</th>
                  <th>Completion Time</th>
                  <th>Turnaround Time</th>
                  <th>Response Time</th>
                  <th>Waiting Time</th>
                </tr>
              </thead>
              <tbody>
                {result.process_table.map((proc, index) => (
                  <tr key={index}>
                    <td>{proc.name}</td>
                    <td>{proc.arrival_time}</td>
                    <td>{proc.burst_time}</td>
                    <td>{proc.start_time}</td>
                    <td>{proc.completion_time}</td>
                    <td>{proc.tat}</td>
                    <td>{proc.rt}</td>
                    <td>{proc.wt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistics */}
          <h2 className="section-title">Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">
                {result.stats.avg_tat.toFixed(2)}
              </div>
              <div className="stat-label">Average Turnaround Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {result.stats.avg_wt.toFixed(2)}
              </div>
              <div className="stat-label">Average Waiting Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {result.stats.avg_rt.toFixed(2)}
              </div>
              <div className="stat-label">Average Response Time</div>
            </div>
          </div>
        </div>
      )}

      {showComparison && compareResults && (
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Algorithm Comparison</h2>
          </div>
          
          <div className="table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Avg. Turnaround Time</th>
                  <th>Avg. Waiting Time</th>
                  <th>Avg. Response Time</th>
                  <th>View Details</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(compareResults).map(([algo, data], index) => (
                  <tr key={index} className={algo === viewingAlgo ? 'active-row' : ''}>
                    <td>{algo}</td>
                    <td>{data.stats.avg_tat.toFixed(2)}</td>
                    <td>{data.stats.avg_wt.toFixed(2)}</td>
                    <td>{data.stats.avg_rt.toFixed(2)}</td>
                    <td>
                      <button 
                        className={`btn ${algo === viewingAlgo ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => viewAlgorithmDetails(algo, data)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <h3 className="section-title">Performance Visualization</h3>
          <div className="comparison-charts">
            <h4>Average Turnaround Time</h4>
            <div className="comparison-chart">
              {Object.entries(compareResults).map(([algo, data], index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-value"
                    style={{ 
                      height: `${data.stats.avg_tat * 10}px`,
                      backgroundColor: getProcessColor(`P${index+1}`)
                    }}
                  >
                    {data.stats.avg_tat.toFixed(1)}
                  </div>
                  <div className="bar-label">{algo}</div>
                </div>
              ))}
            </div>
            
            <h4>Average Waiting Time</h4>
            <div className="comparison-chart">
              {Object.entries(compareResults).map(([algo, data], index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-value"
                    style={{ 
                      height: `${data.stats.avg_wt * 10}px`,
                      backgroundColor: getProcessColor(`P${index+1}`)
                    }}
                  >
                    {data.stats.avg_wt.toFixed(1)}
                  </div>
                  <div className="bar-label">{algo}</div>
                </div>
              ))}
            </div>
            
            <h4>Average Response Time</h4>
            <div className="comparison-chart">
              {Object.entries(compareResults).map(([algo, data], index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-value"
                    style={{ 
                      height: `${data.stats.avg_rt * 10}px`,
                      backgroundColor: getProcessColor(`P${index+1}`)
                    }}
                  >
                    {data.stats.avg_rt.toFixed(1)}
                  </div>
                  <div className="bar-label">{algo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;