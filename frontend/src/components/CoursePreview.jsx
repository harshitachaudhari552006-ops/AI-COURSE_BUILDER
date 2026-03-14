function CoursePreview({ course }) {
  if (!course) {
    return (
      <div className="panel__body">
        <p className="muted">Select a course to view details.</p>
      </div>
    );
  }

  return (
    <div className="panel__body">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{course.level}</p>
          <h2>{course.topic}</h2>
          <p className="muted">{course.summary}</p>
        </div>
        <div className="pill">{course.audience}</div>
      </div>

      <div className="preview__meta">
        <span>{course.durationWeeks} weeks</span>
        <span>{course.modules?.length || 0} modules</span>
        <span>{new Date(course.createdAt).toLocaleString()}</span>
      </div>

      <ol className="modules">
        {course.modules?.map((mod) => (
          <li key={mod.id} className="module">
            <div className="module__header">
              <strong>{mod.title}</strong>
              <p className="muted">{mod.summary}</p>
            </div>
            <ul className="lessons">
              {mod.lessons?.map((lesson) => (
                <li key={lesson.id} className="lesson">
                  <div>
                    <strong>{lesson.title}</strong>
                    <p className="muted">Activity: {lesson.activity}</p>
                  </div>
                  <span className="pill pill--subtle">{lesson.assessment}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default CoursePreview;

