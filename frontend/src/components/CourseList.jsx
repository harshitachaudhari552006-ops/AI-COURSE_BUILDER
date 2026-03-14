function CourseList({ courses, selectedId, onSelect, onRefresh, loading }) {
  return (
    <div className="panel__body">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Library</p>
          <h2>Saved courses</h2>
          <p className="muted">Most recent appears at the top.</p>
        </div>
        <button className="btn btn--ghost" onClick={onRefresh} disabled={loading}>
          Refresh
        </button>
      </div>
      {!courses.length && <p className="muted">No courses yet. Generate one to get started.</p>}
      <ul className="list">
        {courses.map((course) => (
          <li
            key={course.id}
            className={`list__item ${selectedId === course.id ? "list__item--active" : ""}`}
            onClick={() => onSelect(course.id)}
          >
            <div>
              <p className="eyebrow">{course.level}</p>
              <strong>{course.topic}</strong>
              <p className="muted">
                {course.modules?.length || 0} modules · {course.durationWeeks} weeks
              </p>
            </div>
            <span className="pill">{course.audience}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;

