console.log("portfolio.js loaded");

const state = {
    posts: [],
    filter: "all",
    visibleCount: 20,
    mobileSelected: null,
    currentPost: null,
    currentImageIndex: 0
};

const el = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
    cacheElements();
    bindStaticEvents();
    bindTouchEvents(); // 터치 이벤트 초기 바인딩 추가
    await loadPosts();
}

function cacheElements() {
    el.grid = document.getElementById("portfolio-grid");
    el.loadMore = document.getElementById("load-more");
    el.modal = document.getElementById("portfolio-modal");
    el.modalImage = document.getElementById("modal-image");
    el.modalCaption = document.querySelector(".modal-caption");
    el.modalInstagram = document.getElementById("modal-instagram");
    el.modalClose = document.getElementById("modal-close");
    el.filterButtons = document.querySelectorAll(".portfolio-filter a");
}

async function loadPosts() {
    try {
        const response = await fetch("/data/posts.json");
        state.posts = await response.json();
        render();
    } catch (err) { console.error("Posts loading error:", err); }
}

function render() {
    const filtered = state.filter === "all" ? state.posts : state.posts.filter(post => post.tags.includes(state.filter));
    const visible = filtered.slice(0, state.visibleCount);
    if(el.grid) el.grid.innerHTML = visible.map(createPortfolioItem).join("");
    if (el.loadMore) el.loadMore.style.display = state.visibleCount >= filtered.length ? "none" : "inline-block";
    bindPortfolioItems();
}

function createPortfolioItem(post) {
    const lines = post.caption.split("\n");
    const title = lines[0];
    const preview = lines.slice(1).join(" ");
    return `<div class="portfolio-item" data-id="${post.id}"><img src="${post.images ? post.images[0] : post.image}" loading="lazy" alt="${title}"><div class="portfolio-overlay"><h4>${title}</h4><p>${preview}</p></div></div>`;
}

function bindPortfolioItems() {
    document.querySelectorAll(".portfolio-item").forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            const post = state.posts.find(p => p.id == item.dataset.id);
            if (post) openModal(post);
        };
    });
}

function bindStaticEvents() {
    el.filterButtons?.forEach(button => {
        button.addEventListener("click", e => {
            e.preventDefault();
            el.filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            state.filter = button.dataset.filter;
            state.visibleCount = 20;
            render();
        });
    });

    el.loadMore?.addEventListener("click", () => {
        state.visibleCount += 20;
        render();
    });

    el.modalClose?.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
    });
}

// 터치 이벤트 별도 바인딩
function bindTouchEvents() {
    let touchStartX = 0;
    
    // modal-wrapper 전체 영역에서 터치 감지
    document.addEventListener("touchstart", e => {
        if (e.target.closest('#portfolio-modal')) {
            touchStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    document.addEventListener("touchend", e => {
        if (!state.currentPost || !e.target.closest('#portfolio-modal')) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextImage() : prevImage();
        }
    }, { passive: true });
}

function closeModal() {
    el.modal.classList.remove("active");
    document.body.style.overflow = "";
    state.currentPost = null;
}

function openModal(post) {
    state.currentPost = post;
    state.currentImageIndex = 0;
    if (el.modalCaption) el.modalCaption.textContent = post.caption;
    if (el.modalInstagram) el.modalInstagram.href = post.link;
    el.modal.classList.add("active");
    document.body.style.overflow = "hidden";
    
    setTimeout(() => {
        setupModalStructure();
        updateIndicators(post.images.length);
        updateModalImage();
    }, 100);
}

function setupModalStructure() {
    let container = el.modal.querySelector(".modal-wrapper");
    if (!container) {
        container = document.createElement("div");
        container.className = "modal-wrapper";
        const content = el.modal.querySelector(".portfolio-modal-content");
        container.appendChild(el.modalImage);
        content.insertBefore(container, content.firstChild);
    }
    createModalArrows();
}

function updateIndicators(count) {
    let container = el.modal.querySelector(".indicator-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "indicator-container";
        const wrapper = el.modal.querySelector(".modal-wrapper");
        wrapper.parentNode.insertBefore(container, wrapper.nextSibling);
    }
    container.innerHTML = "";
    if (count <= 1) return;
    for(let i = 0; i < count; i++) {
        const dot = document.createElement("span");
        dot.className = i === state.currentImageIndex ? "dot active" : "dot";
        container.appendChild(dot);
    }
}

function createModalArrows() {
    if (document.getElementById("modal-prev")) return;
    const wrapper = el.modal.querySelector(".modal-wrapper");
    if (!wrapper) return;
    wrapper.style.position = "relative";
    
    const prevBtn = document.createElement("div");
    prevBtn.id = "modal-prev";
    prevBtn.className = "modal-arrow";
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    prevBtn.onclick = (e) => { e.stopPropagation(); prevImage(); };
    const nextBtn = document.createElement("div");
    nextBtn.id = "modal-next";
    nextBtn.className = "modal-arrow";
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
    nextBtn.onclick = (e) => { e.stopPropagation(); nextImage(); };
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);
}

function updateModalImage() {
    if (!state.currentPost || !state.currentPost.images || !el.modalImage) return;
    el.modalImage.style.opacity = 0;
    setTimeout(() => {
        el.modalImage.src = state.currentPost.images[state.currentImageIndex];
        el.modalImage.style.opacity = 1;
        const dots = el.modal.querySelectorAll(".dot");
        dots.forEach((dot, index) => {
            dot.className = index === state.currentImageIndex ? "dot active" : "dot";
        });
        updateArrowVisibility();
    }, 200);
}

function nextImage() {
    if (state.currentPost && state.currentImageIndex < state.currentPost.images.length - 1) {
        state.currentImageIndex++;
        updateModalImage();
    }
}

function prevImage() {
    if (state.currentPost && state.currentImageIndex > 0) {
        state.currentImageIndex--;
        updateModalImage();
    }
}

function updateArrowVisibility() {
    const prevBtn = document.getElementById("modal-prev");
    const nextBtn = document.getElementById("modal-next");
    if (!prevBtn || !nextBtn || !state.currentPost) return;
    const hasMultiple = state.currentPost.images && state.currentPost.images.length > 1;
    prevBtn.style.display = (hasMultiple && state.currentImageIndex > 0) ? "block" : "none";
    nextBtn.style.display = (hasMultiple && state.currentImageIndex < state.currentPost.images.length - 1) ? "block" : "none";
}