// Практична 1
const studentName: string = "Анастасія";
const labNumber: number = 1;
const isSubmitted: boolean = true;
function summary(name: string, lab: number, submitted: boolean): string {
  return `Лабораторна №${lab} студентки ${name}: ${submitted ? "здано" : "не здано"}`;
}
console.log(summary(studentName, labNumber, isSubmitted));

// Практична 2 + 4 (інтерактивність + модулі)
type Post = { userId: number; id: number; title: string; body: string };

function openModal(modalEl: HTMLElement | null): void { if (modalEl) modalEl.classList.add("active"); }
function closeModal(modalEl: HTMLElement | null): void { if (modalEl) modalEl.classList.remove("active"); }
function initScroll(headerEl: HTMLElement | null): void {
  if (headerEl) {
    window.addEventListener("scroll", () => {
      const y: number = window.scrollY;
      if (y > 8) headerEl.classList.add("scrolled");
      else headerEl.classList.remove("scrolled");
    });
  }
}
async function loadPosts(postsContainer: HTMLElement | null, limit: number = 5): Promise<void> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await res.json();
  const sliced: Post[] = posts.slice(0, limit);
  if (postsContainer) {
    postsContainer.innerHTML = "";
    for (const p of sliced) {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `<h3>${p.title}</h3><p>${p.body}</p>`;
      postsContainer.appendChild(div);
    }
  }
}

// Виклик модулів
const modalEl = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const headerEl = document.getElementById("hdr");
const postsContainer = document.getElementById("posts");
const loadPostsBtn = document.getElementById("loadPostsBtn");
if (openModalBtn) openModalBtn.addEventListener("click", () => openModal(modalEl));
if (closeModalBtn) closeModalBtn.addEventListener("click", () => closeModal(modalEl));
initScroll(headerEl);
if (loadPostsBtn) loadPostsBtn.addEventListener("click", () => loadPosts(postsContainer, 6));

// Практична 3
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
type TimeSlot = "8:30-10:00" | "10:15-11:45" | "12:15-13:45" | "14:00-15:30" | "15:45-17:15";
type CourseTypeSchedule = "Lecture" | "Seminar" | "Lab" | "Practice";
type Professor = { id: number; name: string; department: string };
type Classroom = { number: string; capacity: number; hasProjector: boolean };
type CourseSchedule = { id: number; name: string; type: CourseTypeSchedule };
type Lesson = { id: number; courseId: number; professorId: number; classroomNumber: string; dayOfWeek: DayOfWeek; timeSlot: TimeSlot };
const professors: Professor[] = [];
const classrooms: Classroom[] = [];
const courses: CourseSchedule[] = [];
const schedule: Lesson[] = [];
function addProfessor(professor: Professor): void { professors.push(professor); }
function addLesson(lesson: Lesson): boolean { if (validateLesson(lesson)) return false; schedule.push(lesson); return true; }
function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): string[] {
  const occupied = new Set<string>();
  for (const l of schedule) if (l.timeSlot === timeSlot && l.dayOfWeek === dayOfWeek) occupied.add(l.classroomNumber);
  return classrooms.map(c => c.number).filter(num => !occupied.has(num));
}
function getProfessorSchedule(professorId: number): Lesson[] { return schedule.filter(l => l.professorId === professorId); }
type ScheduleConflictType = "ProfessorConflict" | "ClassroomConflict";
type ScheduleConflict = { type: ScheduleConflictType; lessonDetails: Lesson };
function validateLesson(lesson: Lesson): ScheduleConflict | null {
  for (const l of schedule) {
    const sameTime = l.dayOfWeek === lesson.dayOfWeek && l.timeSlot === lesson.timeSlot;
    if (sameTime && l.professorId === lesson.professorId) return { type: "ProfessorConflict", lessonDetails: l };
    if (sameTime && l.classroomNumber === lesson.classroomNumber) return { type: "ClassroomConflict", lessonDetails: l };
  }
  return null;
}
function getClassroomUtilization(classroomNumber: string): number {
  const totalSlots = 25;
  const used = schedule.filter(l => l.classroomNumber === classroomNumber).length;
  return Math.round((used / totalSlots) * 100);
}
function getMostPopularCourseType(): CourseTypeSchedule {
  const counter: Record<CourseTypeSchedule, number> = { Lecture: 0, Seminar: 0, Lab: 0, Practice: 0 };
  for (const l of schedule) { const crs = courses.find(c => c.id === l.courseId); if (crs) counter[crs.type]++; }
  return Object.entries(counter).reduce((a, b) => a[1] > b[1] ? a : b)[0] as CourseTypeSchedule;
}
function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
  const idx = schedule.findIndex(l => l.id === lessonId);
  if (idx === -1) return false;
  const candidate = { ...schedule[idx], classroomNumber: newClassroomNumber };
  if (validateLesson(candidate)) return false;
  schedule[idx] = candidate;
  return true;
}
function cancelLesson(lessonId: number): void { const idx = schedule.findIndex(l => l.id === lessonId); if (idx !== -1) schedule.splice(idx, 1); }

// Практична 5
type BaseProduct = { id: number; name: string; price: number };
type Electronics = BaseProduct & { category: "electronics"; brand?: string };
type Clothing = BaseProduct & { category: "clothing"; size?: string };
type Book = BaseProduct & { category: "book"; author?: string };
function findProduct<T extends BaseProduct>(products: T[], id: number): T | undefined { return products.find(p => p.id === id); }
function filterByPrice<T extends BaseProduct>(products: T[], maxPrice: number): T[] { return products.filter(p => p.price <= maxPrice); }
type CartItem<T> = { product: T; quantity: number };
function addToCart<T extends BaseProduct>(cart: CartItem<T>[], product: T, quantity: number): CartItem<T>[] {
  const idx = cart.findIndex(ci => ci.product.id === product.id);
  if (idx !== -1) cart[idx].quantity += quantity; else cart.push({ product, quantity });
  return cart;
}
function calculateTotal<T extends BaseProduct>(cart: CartItem<T>[]): number { return cart.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0); }
const electronics: Electronics[] = [{ id: 1, name: "Телефон", price: 10000, category: "electronics", brand: "Acme" }];
const phone = findProduct(electronics, 1)!;
const cart = addToCart([], phone, 1);
console.log("Cart total:", calculateTotal(cart));

// Практична 6
enum StudentStatus { Active, Academic_Leave, Graduated, Expelled }
enum CourseType { Mandatory, Optional, Special }
enum Semester { First, Second }
enum GradeValue { Excellent = 5, Good = 4, Satisfactory = 3, Unsatisfactory = 2 }
enum Faculty { Computer_Science, Economics, Law, Engineering }
interface Student { id: number; fullName: string; faculty: Faculty; year: number; status: StudentStatus; enrollmentDate: Date; groupNumber: string; }
interface Course { id: number; name: string; type: CourseType; credits: number; semester: Semester; faculty: Faculty; maxStudents: number; }
interface Grade { studentId: number; courseId: number; grade: Grade
  enum StudentStatus { Active, Academic_Leave, Graduated, Expelled }
enum CourseType { Mandatory, Optional, Special }
enum Semester { First, Second }
enum GradeValue { Excellent = 5, Good = 4, Satisfactory = 3, Unsatisfactory = 2 }
enum Faculty { Computer_Science, Economics, Law, Engineering }

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
  type: CourseType;
  credits: number;
  semester: Semester;
  faculty: Faculty;
  maxStudents: number;
}
interface Grade {
  studentId: number;
  courseId: number;
  grade: GradeValue;
  date: Date;
  semester: Semester;
}

class UniversityManagementSystem {
  private students: Student[] = [];
  private courses: Course[] = [];
  private registrations: Map<number, Set<number>> = new Map();
  private grades: Grade[] = [];
  private studentIdCounter: number = 1;
  private courseIdCounter: number = 1;

  addCourse(course: Omit<Course, "id">): Course {
    const c: Course = { id: this.courseIdCounter++, ...course };
    this.courses.push(c);
    return c;
  }

  enrollStudent(student: Omit<Student, "id">): Student {
    const s: Student = { id: this.studentIdCounter++, ...student };
    this.students.push(s);
    return s;
  }

  registerForCourse(studentId: number, courseId: number): void {
    const student = this.students.find(s => s.id === studentId);
    const course = this.courses.find(c => c.id === courseId);
    if (!student || !course) throw new Error("Студент або курс не знайдені");
    if (student.faculty !== course.faculty) throw new Error("Факультет не відповідає");
    const totalRegistered = Array.from(this.registrations.values()).filter(set => set.has(courseId)).length;
    if (totalRegistered >= course.maxStudents) throw new Error("Перевищено ліміт студентів");
    if (student.status !== StudentStatus.Active) throw new Error("Студент неактивний");
    const set = this.registrations.get(studentId) ?? new Set<number>();
    set.add(courseId);
    this.registrations.set(studentId, set);
  }

  setGrade(studentId: number, courseId: number, grade: GradeValue): void {
    const student = this.students.find(s => s.id === studentId);
    const course = this.courses.find(c => c.id === courseId);
    if (!student || !course) throw new Error("Студент або курс не знайдені");
    const reg = this.registrations.get(studentId);
    if (!reg || !reg.has(courseId)) throw new Error("Студент не зареєстрований");
    const g: Grade = { studentId, courseId, grade, date: new Date(), semester: course.semester };
    this.grades.push(g);
  }

  updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
    const student = this.students.find(s => s.id === studentId);
    if (!student) throw new Error("Студент не знайдений");
    if (student.status === StudentStatus.Graduated && newStatus !== StudentStatus.Graduated) throw new Error("Не можна змінити після випуску");
    if (student.status === StudentStatus.Expelled && newStatus !== StudentStatus.Expelled) throw new Error("Не можна змінити після відрахування");
    student.status = newStatus;
  }

  getStudentsByFaculty(faculty: Faculty): Student[] { return this.students.filter(s => s.faculty === faculty); }
  getStudentGrades(studentId: number): Grade[] { return this.grades.filter(g => g.studentId === studentId); }
  getAvailableCourses(faculty: Faculty, semester: Semester): Course[] { return this.courses.filter(c => c.faculty === faculty && c.semester === semester); }
  calculateAverageGrade(studentId: number): number {
    const gs = this.getStudentGrades(studentId);
    if (gs.length === 0) return 0;
    const sum = gs.reduce((acc, g) => acc + g.grade, 0);
    return Math.round((sum / gs.length) * 100) / 100;
  }
  getExcellentStudentsByFaculty(faculty: Faculty): Student[] {
    return this.getStudentsByFaculty(faculty).filter(s => this.calculateAverageGrade(s.id) >= 4.5);
  }
}

// Демонстрація
const ums = new UniversityManagementSystem();
const csCourse = ums.addCourse({ name: "Алгоритми", type: CourseType.Mandatory, credits: 6, semester: Semester.First, faculty: Faculty.Computer_Science, maxStudents: 2 });
const s1 = ums.enrollStudent({ fullName: "Студент 1", faculty: Faculty.Computer_Science, year: 1, status: StudentStatus.Active, enrollmentDate: new Date(), groupNumber: "CS-101" });
const s2 = ums.enrollStudent({ fullName: "Студент 2", faculty: Faculty.Computer_Science, year: 1, status: StudentStatus.Active, enrollmentDate: new Date(), groupNumber: "CS-102" });
ums.registerForCourse(s1.id, csCourse.id);
ums.registerForCourse(s2.id, csCourse.id);
ums.setGrade(s1.id, csCourse.id, GradeValue.Excellent);
ums.setGrade(s2.id, csCourse.id, GradeValue.Good);
console.log("AVG s1:", ums.calculateAverageGrade(s1.id));
console.log("Excellent CS:", ums.getExcellentStudentsByFaculty(Faculty.Computer_Science).map(s => s.fullName));

 
