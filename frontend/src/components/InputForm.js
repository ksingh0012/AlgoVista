import React, { useState } from "react";

const InputForm = ({ onSubmit, selectedAlgo }) => {
  const [processes, setProcesses] = useState([]);
  const [form, setForm] = useState({ name: "", arrival_time: "", burst_time: "", priority: "" });
  const [timeQuantum, setTimeQuantum] = useState("");

  const handleAddProcess = () => {
    setProcesses([...processes, { ...form }]);
    setForm({ name: "", arrival_time: "", burst_time: "", priority: "" });
  };

  const handleSubmit = () => {
    const data = {
      algorithm: selectedAlgo,
      processes: processes.map((p) => ({
        name: p.name,
        arrival_time: parseInt(p.arrival_time),
        burst_time: parseInt(p.burst_time),
        ...(selectedAlgo.includes("PRIORITY") && { priority: parseInt(p.priority) }),
      })),
      ...(selectedAlgo === "Round Robin" && { time_quanta: parseInt(timeQuantum) }),
    };
    onSubmit(data);
  };

  return (
    <div>
      <h3>Enter Process Details</h3>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input type="number" placeholder="Arrival Time" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} />
      <input type="number" placeholder="Burst Time" value={form.burst_time} onChange={(e) => setForm({ ...form, burst_time: e.target.value })} />
      {selectedAlgo.includes("PRIORITY") && (
        <input type="number" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
      )}
      <button onClick={handleAddProcess}>Add Process</button>

      {selectedAlgo === "Round Robin" && (
        <input type="number" placeholder="Time Quantum" value={timeQuantum} onChange={(e) => setTimeQuantum(e.target.value)} />
      )}

      <button onClick={handleSubmit}>Run</button>

      <ul>
        {processes.map((p, i) => (
          <li key={i}>
            {p.name} - AT: {p.arrival_time}, BT: {p.burst_time} {p.priority && `, Priority: ${p.priority}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InputForm;
