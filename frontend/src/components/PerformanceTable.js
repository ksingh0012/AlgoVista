import React from "react";

const PerformanceTable = ({ table }) => {
  if (!table || table.length === 0) return null;

  return (
    <div>
      <h3>Performance Table</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Completion</th>
            <th>Turnaround</th>
            <th>Waiting</th>
          </tr>
        </thead>
        <tbody>
          {table.map((p, i) => (
            <tr key={i}>
              <td>{p.name}</td>
              <td>{p.arrival_time}</td>
              <td>{p.burst_time}</td>
              <td>{p.completion_time}</td>
              <td>{p.turnaround_time}</td>
              <td>{p.waiting_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTable;
