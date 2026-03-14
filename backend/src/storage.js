import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), "backend", "data");
const coursesFile = path.join(dataDir, "courses.json");

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readCourses() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(coursesFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeCourses(courses) {
  await ensureDataDir();
  await fs.writeFile(coursesFile, JSON.stringify(courses, null, 2));
}

export async function listCourses() {
  return readCourses();
}

export async function saveCourse(course) {
  const courses = await readCourses();
  courses.unshift(course);
  await writeCourses(courses);
  return course;
}

export async function findCourse(id) {
  const courses = await readCourses();
  return courses.find((c) => c.id === id);
}

