// ===== Модальне вікно =====
const modal = document.getElementById("myModal");
const btn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

if (btn && modal && closeBtn) {
  btn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// ===== Scroll event =====
window.addEventListener("scroll", () => {
  console.log("Користувач прокручує сторінку");
});

// ===== Fetch даних з JSONPlaceholder =====
async function loadData() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const container = document.getElementById("dataContainer");

    if (container) {
      container.innerHTML = data
        .slice(0, 5) // показати перші 5 постів
        .map((post) => `<p><strong>${post.id}:</strong> ${post.title}</p>`)
        .join("");
    }
  } catch (error) {
    console.error("Помилка завантаження даних:", error);
  }
}

loadData();
