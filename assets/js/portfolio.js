console.log("portfolio.js loaded");

let posts = [];
let filter = "all";
let visibleCount = 20;

fetch("/data/posts.json")
  .then(res => {
    console.log("fetch status:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("posts loaded:", data);

    posts = data;

    render();
  })
  .catch(err => {
    console.error("JSON ERROR:", err);
  });

function render() {

  console.log("render called");

  const grid = document.getElementById("portfolio-grid");

  console.log("grid =", grid);

  const filtered =
    filter === "all"
      ? posts
      : posts.filter(p => p.tags.includes(filter));
  const visiblePosts =
    filtered.slice(0, visibleCount);
  console.log("filtered =", filtered.length);

  grid.innerHTML = visiblePosts.map(p => `
    <a class="portfolio-item" href="${p.link}" target="_blank">
      <img src="${p.image}">
    </a>
  `).join("");
  const loadMore =
    document.getElementById("load-more");

  if (loadMore) {

    loadMore.style.display =
      visibleCount >= filtered.length
        ? "none"
        : "inline-block";

  }
}

document.querySelectorAll(".portfolio-filter a")
  .forEach(btn => {

    btn.addEventListener("click", function (e) {

      e.preventDefault();

      console.log("clicked:", this.dataset.filter);

      document.querySelectorAll(".portfolio-filter a")
        .forEach(a => a.classList.remove("active"));

      this.classList.add("active");

      filter = this.dataset.filter;
      visibleCount = 20

      render();

    });

  });
document
  .getElementById("load-more")
  .addEventListener("click", () => {

    visibleCount += 20;

    render();

  });
console.log("event listener registered");