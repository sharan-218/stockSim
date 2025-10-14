// ModelSelect.jsx

export default function ModelSelect({ model, setModel }) {
  const models = [
    { id: "gbm", name: "Geometric Brownian Motion" },
    { id: "ou", name: "Ornstein–Uhlenbeck" },
    { id: "garch", name: "GARCH (1,1)" },
    { id: "jump_diffusion", name: "Jump Diffusion" },
  ];

  return (
    // Replacing DaisyUI 'form-control' with custom 'form-control-modern'
    <div className="form-control-modern w-full"> 
      
      {/* Replacing DaisyUI 'label' and 'label-text' with custom 'label-modern' */}
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