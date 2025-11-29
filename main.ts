/********************************************************************************************
 * Практична №1: Базові типи та компіляція
 ********************************************************************************************/
const greeting: string = "Вітаю, TypeScript!";
const year: number = 2025;
const isActive: boolean = true;

function formatGreeting(name: string, active: boolean): string {
  const status = active ? "активний" : "неактивний";
  return `${greeting} ${name}, статус: ${status}.`;
}
const demoMessage = formatGreeting("Анастасія", isActive);

/********************************************************************************************
 * Практична №2: Система розкладу університету (type aliases, union types, функції)
 ********************************************************************************************/
// types/schedule-types.ts (у feature/modules винести окремо)
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
type TimeSlot =
  | "8:30-10:00"
  | "10:15-11:45"
  | "12:15-13:45"
  | "14:00-15:30"
  | "15:45-17:15";
type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

type Professor = { id: number; name: string; department: string };
type Classroom = { number: string; capacity: number; hasProjector: boolean };
type Course = { id: number; name: string; type: CourseType };
type Lesson = {
  id: number;
  courseId: number;
  professorId: number;
  classroomNumber: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
};

type ScheduleConflict = {
  type: "ProfessorConflict" | "ClassroomConflict";
  lessonDetails: Lesson;
};

// modules/schedule.ts (у feature/modules винести окремо)
const professors: Professor[] = [];
const classrooms: Classroom[] = [];
const courses: Course[] = [];
const schedule: Lesson[] = [];

function addProfessor(professor: Professor): void {
  if (professors.some((p) => p.id === professor.id)) {
    throw new Error("Професор з таким id вже існує.");
  }
  professors.push(professor);
}

function validateLesson(lesson: Lesson): ScheduleConflict | null {
  const professorConflict = schedule.find(
    (l) =>
      l.professorId === lesson.professorId &&
      l.dayOfWeek === lesson.dayOfWeek &&
      l.timeSlot === lesson.timeSlot
  );
  if (professorConflict) return { type: "ProfessorConflict", lessonDetails: professorConflict };

  const classroomConflict = schedule.find(
    (l) =>
      l.classroomNumber === lesson.classroomNumber &&
      l.dayOfWeek === lesson.dayOfWeek &&
      l.timeSlot === lesson.timeSlot
  );
  if (classroomConflict) return { type: "ClassroomConflict", lessonDetails: classroomConflict };

  return null;
}

function addLesson(lesson: Lesson): boolean {
  // Перевірка валідності посилань
  const profExists = professors.some((p) => p.id === lesson.professorId);
  const courseExists = courses.some((c) => c.id === lesson.courseId);
  const classExists = classrooms.some((c) => c.number === lesson.classroomNumber);
  if (!profExists || !courseExists || !classExists) return false;

  if (validateLesson(lesson)) return false;
  schedule.push(lesson);
  return true;
}

function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): string[] {
  const occupied = new Set(
    schedule.filter((l) => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot).map((l) => l.classroomNumber)
  );
  return classrooms.filter((c) => !occupied.has(c.number)).map((c) => c.number);
}

function getProfessorSchedule(professorId: number): Lesson[] {
  return schedule.filter((l) => l.professorId === professorId);
}

function getClassroomUtilization(classroomNumber: string): number {
  const totalSlotsPerWeek = 25; // 5 днів * 5 слотів
  const used = schedule.filter((l) => l.classroomNumber === classroomNumber).length;
  const percent = (used / totalSlotsPerWeek) * 100;
  return Math.round(percent * 100) / 100;
}

function getMostPopularCourseType(): CourseType {
  const counts: Record<CourseType, number> = { Lecture: 0, Seminar: 0, Lab: 0, Practice: 0 };
  for (const l of schedule) {
    const course = courses.find((c) => c.id === l.courseId);
    if (course) counts[course.type]++;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as CourseType;
}

function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
  const lesson = schedule.find((l) => l.id === lessonId);
  if (!lesson) return false;
  const candidate: Lesson = { ...lesson, classroomNumber: newClassroomNumber };
  if (validateLesson(candidate)) return false;
  lesson.classroomNumber = newClassroomNumber;
  return true;
}

function cancelLesson(lessonId: number): void {
  const idx = schedule.findIndex((l) => l.id === lessonId);
  if (idx >= 0) schedule.splice(idx, 1);
}

// Дані для прикладу
classrooms.push(
  { number: "A101", capacity: 30, hasProjector: true },
  { number: "B201", capacity: 40, hasProjector: false }
);
courses.push(
  { id: 1, name: "Алгебра", type: "Lecture" },
  { id: 2, name: "Програмування", type: "Lab" }
);
addProfessor({ id: 1, name: "Іван Іванов", department: "Math" });
// addLesson({ id: 10, courseId: 1, professorId: 1, classroomNumber: "A101", dayOfWeek: "Monday", timeSlot: "8:30-10:00" });

/********************************************************************************************
 * Практична №3: Інтерактивність для HTML/CSS (TS -> JS)
 ********************************************************************************************/
// modules/ui.ts (у feature/modules винести окремо)
function openModal(modalId: string): void {
  if (typeof document === "undefined") return;
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "block";
}
function closeModal(modalId: string): void {
  if (typeof document === "undefined") return;
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}
function bindModalButtons(openBtnId: string, closeBtnId: string, modalId: string): void {
  if (typeof document === "undefined") return;
  const openBtn = document.getElementById(openBtnId);
  const closeBtn = document.getElementById(closeBtnId);
  openBtn?.addEventListener("click", () => openModal(modalId));
  closeBtn?.addEventListener("click", () => closeModal(modalId));
}
function bindScrollListener(threshold: number): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (header) header.classList.toggle("scrolled", window.scrollY > threshold);
  });
}
function animateElementOpacity(elId: string, durationMs: number): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(elId);
  if (!el) return;
  let start: number | null = null;
  function step(timestamp: number) {
    if (start === null) start = timestamp;
    const progress = Math.min((timestamp - start) / durationMs, 1);
    el.style.opacity = String(progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
async function fetchAndRenderPosts(containerId: string, limit: number): Promise<void> {
  if (typeof document === "undefined") return;
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { userId: number; id: number; title: string; body: string }[] = await res.json();
    container.innerHTML = data
      .slice(0, limit)
      .map((p) => `<article class="post"><h3>${p.title}</h3><p>${p.body}</p><small>ID: ${p.id}</small></article>`)
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="error">Не вдалося завантажити дані: ${(err as Error).message}</p>`;
  }
}
function initUI(): void {
  bindModalButtons("openModalBtn", "closeModalBtn", "mainModal");
  bindScrollListener(100);
  animateElementOpacity("hero", 800);
  fetchAndRenderPosts("postsContainer", 5);
}

/********************************************************************************************
 * Практична №4: Інтернет-магазин (generic типи, кошик)
 ********************************************************************************************/
// types/shop-types.ts (у feature/modules винести окремо)
type BaseProduct = {
  id: number;
  name: string;
  price: number;
  description?: string;
  inStock?: boolean;
};
type Electronics = BaseProduct & { category: "electronics"; warrantyMonths?: number; brand?: string };
type Clothing = BaseProduct & { category: "clothing"; size?: "XS" | "S" | "M" | "L" | "XL"; material?: string };
type Book = BaseProduct & { category: "book"; author?: string; pages?: number };

// modules/shop.ts (у feature/modules винести окремо)
function findProduct<T extends BaseProduct>(products: T[], id: number): T | undefined {
  if (!Array.isArray(products) || typeof id !== "number") return undefined;
  return products.find((p) => p.id === id);
}
function filterByPrice<T extends BaseProduct>(products: T[], maxPrice: number): T[] {
  if (!Array.isArray(products) || typeof maxPrice !== "number") return [];
  return products.filter((p) => p.price <= maxPrice);
}
type CartItem<T> = { product: T; quantity: number };
function addToCart<T extends BaseProduct>(
  cart: CartItem<T>[],
  product: T | undefined,
  quantity: number
): CartItem<T>[] {
  if (!product || quantity <= 0) return cart.slice();
  const idx = cart.findIndex((c) => c.product.id === product.id);
  const next = cart.slice();
  if (idx >= 0) {
    next[idx] = { product: next[idx].product, quantity: next[idx].quantity + quantity };
  } else {
    next.push({ product, quantity });
  }
  return next;
}
function calculateTotal<T extends BaseProduct>(cart: CartItem<T>[]): number {
  if (!Array.isArray(cart)) return 0;
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
// Тестові дані
const electronicsData: Electronics[] = [
  { id: 1, name: "Телефон", price: 10000, category: "electronics", brand: "Acme", warrantyMonths: 12 },
  { id: 2, name: "Ноутбук", price: 30000, category: "electronics", brand: "Acme", warrantyMonths: 24 },
];
const phone = findProduct(electronicsData, 1);
const cart1 = addToCart<Electronics>([], phone, 1);
const total1 = calculateTotal(cart1);

/********************************************************************************************
 * Практична №5: Логічне розбиття на модулі (types / modules) + головний main.ts
 * Важливо: тут ми зберігаємо все в одному файлі, але показуємо, як має бути організовано.
 * У гілці feature/modules:
 *  - src/types/schedule-types.ts, src/types/shop-types.ts, src/ums/enums.ts, src/ums/interfaces.ts
 *  - src/modules/schedule.ts, src/modules/ui.ts, src/modules/shop.ts, src/ums/ums.ts
 *  - src/main.ts імпортує все та викликає ініціалізації.
 ********************************************************************************************/
// main.ts (псевдо-імпорти — у файлі модулі вже “під рукою”):
// import { DayOfWeek, TimeSlot, CourseType, Professor, Classroom, Course, Lesson } from "./types/schedule-types";
// import { BaseProduct, Electronics, Clothing, Book } from "./types/shop-types";
// import { openModal, closeModal, initUI } from "./modules/ui";
// import { addLesson, findAvailableClassrooms } from "./modules/schedule";
// import { findProduct, addToCart, calculateTotal } from "./modules/shop";
// import { UniversityManagementSystem, Faculty, Semester, StudentStatus, GradeEnum, CourseTypeEnum } from "./ums/ums";

function bootApp(): void {
  // UI
  if (typeof window !== "undefined") {
    (window as any).initUI = initUI;
  }
  // Schedule demo
  const ok = addLesson({
    id: 100,
    courseId: 1,
    professorId: 1,
    classroomNumber: "A101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00",
  });
  // Shop demo already executed above (phone, cart1, total1)
}
bootApp();

/********************************************************************************************
 * Практична №6: UniversityManagementSystem (Enums, Interfaces, Class, валідації)
 ********************************************************************************************/
// ums/enums.ts (у feature/modules винести окремо)
enum StudentStatus {
  Active = "Active",
  Academic_Leave = "Academic_Leave",
  Graduated = "Graduated",
  Expelled = "Expelled",
}
enum CourseTypeEnum {
  Mandatory = "Mandatory",
  Optional = "Optional",
  Special = "Special",
}
enum Semester {
  First = "First",
  Second = "Second",
}
enum GradeEnum {
  Excellent = 5,
  Good = 4,
  Satisfactory = 3,
  Unsatisfactory = 2,
}
enum Faculty {
  Computer_Science = "Computer_Science",
  Economics = "Economics",
  Law = "Law",
  Engineering = "Engineering",
}

// ums/interfaces.ts (у feature/modules винести окремо)
interface Student {
  id: number;
  fullName: string;
  faculty: Faculty;
  year: number;
  status: StudentStatus;
  enrollmentDate: Date;
  groupNumber: string;
}
interface Course {
  id: number;
  name: string;
  type: CourseTypeEnum;
  credits: number;
  semester: Semester;
  faculty: Faculty;
  maxStudents: number;
}
interface Grade {
  studentId: number;
  courseId: number;
  grade: GradeEnum;
  date: Date;
  semester: Semester;
}

// ums/ums.ts (у feature/modules винести окремо)
class UniversityManagementSystem {
  private students: Student[] = [];
  private courses: Course[] = [];
  private registrations: Map<number, Set<number>> = new Map(); // studentId -> Set<courseId>
  private grades: Grade[] = [];
  private nextStudentId = 1;

  addCourse(course: Course): void {
    const exists = this.courses.some((c) => c.id === course.id);
    if (exists) throw new Error("Курс з таким id вже існує.");
    this.courses.push(course);
  }

  enrollStudent(student: Omit<Student, "id">): Student {
    if (!student.fullName || !student.groupNumber) throw new Error("Некоректні дані студента.");
    const newStudent: Student = { ...student, id: this.nextStudentId++ };
    this.students.push(newStudent);
    this.registrations.set(newStudent.id, new Set());
    return newStudent;
  }

  registerForCourse(studentId: number, courseId: number): void {
    const student = this.students.find((s) => s.id === studentId);
    const course = this.courses.find((c) => c.id === courseId);
    if (!student || !course) throw new Error("Студент або курс не знайдені.");
    if (student.faculty !== course.faculty) throw new Error("Факультет студента не відповідає факультету курсу.");
    if (student.status !== StudentStatus.Active)
      throw new Error("Студент повинен бути Active для реєстрації на курс.");

    const totalRegisteredForCourse = this.students.filter((s) => {
      const set = this.registrations.get(s.id);
      return set ? set.has(courseId) : false;
    }).length;
    if (totalRegisteredForCourse >= course.maxStudents) throw new Error("Досягнуто ліміт студентів на курс.");

    const regSet = this.registrations.get(studentId);
    if (!regSet) throw new Error("Технічна помилка реєстрації.");
    if (regSet.has(courseId)) throw new Error("Студент вже зареєстрований на курс.");

    regSet.add(courseId);
  }

  setGrade(studentId: number, courseId: number, grade: GradeEnum): void {
    const student = this.students.find((s) => s.id === studentId);
    const course = this.courses.find((c) => c.id === courseId);
    if (!student || !course) throw new Error("Студент або курс не знайдені.");
    const regSet = this.registrations.get(studentId);
    if (!regSet || !regSet.has(courseId)) throw new Error("Студент не зареєстрований на курс.");

    this.grades.push({ studentId, courseId, grade, date: new Date(), semester: course.semester });
  }

  updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) throw new Error("Студент не знайдений.");

    if (student.status === StudentStatus.Graduated || student.status === StudentStatus.Expelled) {
      throw new Error("Неможливо змінити статус: завершив навчання або відрахований.");
    }
    if (newStatus === StudentStatus.Academic_Leave && student.status !== StudentStatus.Active) {
      throw new Error("На академвідпустку можна перейти лише зі статусу Active.");
    }
    student.status = newStatus;
  }

  getStudentsByFaculty(faculty: Faculty): Student[] {
    return this.students.filter((s) => s.faculty === faculty);
  }
  getStudentGrades(studentId: number): Grade[] {
    return this.grades.filter((g) => g.studentId === studentId);
  }
  getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
    return this.courses.filter((c) => c.faculty === faculty && c.semester === semester);
  }
  calculateAverageGrade(studentId: number): number {
    const list = this.getStudentGrades(studentId);
    if (list.length === 0) return 0;
    const avg = list.reduce((sum, g) => sum + g.grade, 0) / list.length;
    return Math.round(avg * 100) / 100;
  }
  getExcellentStudentsByFaculty(faculty: Faculty): Student[] {
    const students = this.getStudentsByFaculty(faculty);
    return students.filter((s) => this.calculateAverageGrade(s.id) >= 4.5);
  }
}

// Приклад використання UMS
const ums = new UniversityManagementSystem();
ums.addCourse({
  id: 101,
  name: "Алгоритми",
  type: CourseTypeEnum.Mandatory,
  credits: 6,
  semester: Semester.First,
  faculty: Faculty.Computer_Science,
  maxStudents: 2,
});
ums.addCourse({
  id: 102,
  name: "Економіка підприємства",
  type: CourseTypeEnum.Optional,
  credits: 5,
  semester: Semester.Second,
  faculty: Faculty.Economics,
  maxStudents: 3,
});
const st1 = ums.enrollStudent({
  fullName: "Петренко Іван",
  faculty: Faculty.Computer_Science,
  year: 1,
  status: StudentStatus.Active,
  enrollmentDate: new Date("2025-09-01"),
  groupNumber: "CS-11",
});
const st2 = ums.enrollStudent({
  fullName: "Коваленко Олена",
  faculty: Faculty.Computer_Science,
  year: 1,
  status: StudentStatus.Active,
  enrollmentDate: new Date("2025-09-01"),
  groupNumber: "CS-12",
});
ums.registerForCourse(st1.id, 101);
ums.registerForCourse(st2.id, 101);
ums.setGrade(st1.id, 101, GradeEnum.Excellent);
ums.setGrade(st2.id, 101, GradeEnum.Good);
const avgSt1 = ums.calculateAverageGrade(st1.id);
const excellentCS = ums.getExcellentStudentsByFaculty(Faculty.Computer_Science);
// console.log("Avg st1:", avgSt1, "Excellent:", excellentCS);

