import React from "react";

const CompareChart = ({ stats }) => {
  return (
    <div>
      <h3>Algorithm Comparison</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Average Waiting Time</th>
            <th>Average Turnaround Time</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats).map(([algo, val]) => (
            <tr key={algo}>
              <td>{algo}</td>
              <td>{val.avg_waiting_time.toFixed(2)}</td>
              <td>{val.avg_turnaround_time.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompareChart;
