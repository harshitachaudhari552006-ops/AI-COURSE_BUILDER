import { useState } from "react";

const defaultState = {
  topic: "Generative AI Fundamentals",
  level: "Beginner",
  audience: "Students",
  modules: 5,
  durationWeeks: 4,
};

function CourseForm({ onSubmit, loading }) {
  const [form, setForm] = useState(defaultState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "modules" || name === "durationWeeks" ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div>
      <div className="panel__header">
        <div>
          <p className="eyebrow">Generator</p>
          <h2>Create a new course</h2>
          <p className="muted">No API keys required—content is generated locally.</p>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          <span>Topic</span>
          <input
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="e.g., Prompt Engineering"
            required
          />
        </label>

        <label className="form__field">
          <span>Level</span>
          <select name="level" value={form.level} onChange={handleChange}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>

        <label className="form__field">
          <span>Audience</span>
          <input
            name="audience"
            value={form.audience}
            onChange={handleChange}
            placeholder="e.g., Product Managers"
            required
          />
        </label>

        <div className="form__grid">
          <label className="form__field">
            <span>Modules</span>
            <input
              type="number"
              name="modules"
              min="3"
              max="10"
              value={form.modules}
              onChange={handleChange}
            />
          </label>
          <label className="form__field">
            <span>Duration (weeks)</span>
            <input
              type="number"
              name="durationWeeks"
              min="1"
              max="52"
              value={form.durationWeeks}
              onChange={handleChange}
            />
          </label>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate course"}
        </button>
      </form>
    </div>
  );
}

export default CourseForm;

