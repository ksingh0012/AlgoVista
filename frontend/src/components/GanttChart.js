import React from "react";

const GanttChart = ({ gantt }) => {
  return (
    <div>
      <h3>Gantt Chart</h3>
      <div style={{ display: "flex", border: "1px solid black" }}>
        {gantt.map((block, index) => (
          <div key={index} style={{ padding: "10px", borderRight: "1px solid black" }}>
            {block.name} ({block.start}-{block.end})
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
