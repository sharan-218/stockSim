import React from "react";
export default function ModelSelect({ model, setModel }) {
  const models = [
    { id: "gbm", name: "Geometric Brownian Motion" },
    { id: "ou", name: "Ornstein–Uhlenbeck" },
    { id: "garch", name: "GARCH (1,1)" },
    { id: "jump_diffusion", name: "Jump Diffusion" },

  ];

  return (
    <div className="form-control-modern w-full">
      <label className="label-modern">
        Select Model
      </label>

      <select
        className="select-modern w-full"
        value={model}
        onChange={(e) => setModel(e.target.value)}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}