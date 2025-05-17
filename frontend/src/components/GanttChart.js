import React from 'react';

const GanttChart = ({ result, getProcessColor, selectedAlgo, compareResults, backToComparison }) => {
  return (
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
    </div>
  );
};

export default GanttChart;
