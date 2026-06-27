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

    el.filterButtons =
        document.querySelectorAll(".portfolio-filter a");

}

async function loadPosts() {

    try {

        const response =
            await fetch("/data/posts.json");

        state.posts =
            await response.json();

        console.log(
            `${state.posts.length} posts loaded`
        );

        render();

    }

    catch (err) {

        console.error(err);

    }

}

function render() {

    const filtered =
        state.filter === "all"

            ? state.posts

            : state.posts.filter(post =>
                post.tags.includes(state.filter)
            );

    const visible =
        filtered.slice(
            0,
            state.visibleCount
        );

    el.grid.innerHTML =
        visible.map(createPortfolioItem).join("");

    if (el.loadMore) {

        el.loadMore.style.display =

            state.visibleCount >= filtered.length

                ? "none"

                : "inline-block";

    }

    requestAnimationFrame(() => {

        window.dispatchEvent(
            new Event("resize")
        );

    });

    bindPortfolioItems();

}

function createPortfolioItem(post) {

    const lines =
        post.caption.split("\n");

    const title =
        lines[0];

    const preview =
        lines
            .slice(1)
            .join(" ");

    const actionText =

        window.innerWidth <= 736

            ? "Tap again to view"

            : "Click to View";

    return `

<div class="portfolio-item" data-id="${post.id}">

    <img
        src="${post.images ? post.images[0] : post.image}"
        loading="lazy"
        alt="${title}">

    <div class="portfolio-overlay">

        <h4>${title}</h4>

        <p>${preview}</p>

        <span>${actionText}</span>

    </div>

</div>

`;

}
function bindPortfolioItems() {

    document
        .querySelectorAll(".portfolio-item")
        .forEach(item => {

            item.onclick = (e) => {
                e.stopPropagation();

                const id = item.dataset.id;

                const post =
                    state.posts.find(p => p.id == id);

                if (!post) return;

                // 모바일
                if (window.innerWidth <= 736) {

                    if (state.mobileSelected !== item) {

                        showMobileOverlay(item);

                        return;

                    }

                }

                openModal(post);

            };

        });

}

function showMobileOverlay(item) {

    hideMobileOverlay();

    item.classList.add("mobile-active");

    state.mobileSelected = item;

}

function hideMobileOverlay() {

    document
        .querySelectorAll(".portfolio-item")
        .forEach(item =>
            item.classList.remove("mobile-active")
        );

    state.mobileSelected = null;

}

document.addEventListener("click", e => {

    if (window.innerWidth > 736)
        return;

    if (e.target.closest(".portfolio-item"))
        return;

    if (
        el.modal.classList.contains("active")
    )
        return;

    hideMobileOverlay();

});

function openModal(post) {
    state.currentPost = post;
    state.currentImageIndex = 0;

    // 1. 모달 화살표 버튼 생성
    createModalArrows();

    // 2. 이미지 및 화살표 상태 업데이트
    updateModalImage();
    updateArrowVisibility();

    el.modalCaption.textContent = post.caption;
    el.modalInstagram.href = post.link;
    el.modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// 화살표 생성 함수
function createModalArrows() {
    // 기존 컨테이너 확인
    let imageContainer = el.modal.querySelector(".modal-image-container");
    if (!imageContainer) {
        imageContainer = document.createElement("div");
        imageContainer.className = "modal-image-container";
        el.modalImage.parentNode.insertBefore(imageContainer, el.modalImage);
        imageContainer.appendChild(el.modalImage);
    }

    if (!document.getElementById("modal-prev")) {
        const prevBtn = document.createElement("div");
        prevBtn.id = "modal-prev";
        prevBtn.className = "modal-arrow";
        prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
        prevBtn.onclick = (e) => { e.stopPropagation(); prevImage(); };
        imageContainer.appendChild(prevBtn);
    }
    
    if (!document.getElementById("modal-next")) {
        const nextBtn = document.createElement("div");
        nextBtn.id = "modal-next";
        nextBtn.className = "modal-arrow";
        nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
        nextBtn.onclick = (e) => { e.stopPropagation(); nextImage(); };
        imageContainer.appendChild(nextBtn);
    }
    
    el.modalPrev = document.getElementById("modal-prev");
    el.modalNext = document.getElementById("modal-next");
}

// 화살표 보이기/숨기기
function updateArrowVisibility() {
    const prevBtn = document.getElementById("modal-prev");
    const nextBtn = document.getElementById("modal-next");
    if (!prevBtn || !nextBtn) return;

    const hasMultiple = state.currentPost.images && state.currentPost.images.length > 1;
    prevBtn.style.display = (hasMultiple && state.currentImageIndex > 0) ? "block" : "none";
    nextBtn.style.display = (hasMultiple && state.currentImageIndex < state.currentPost.images.length - 1) ? "block" : "none";
}

function updateModalImage() {
    if (!state.currentPost || !state.currentPost.images) return;
    el.modalImage.src = state.currentPost.images[state.currentImageIndex];
    updateArrowVisibility(); // 이미지 변경 시 버튼 상태 갱신
}

function nextImage() {
    if (!state.currentPost || !state.currentPost.images) return;
    if (state.currentImageIndex < state.currentPost.images.length - 1) {
        state.currentImageIndex++;
        updateModalImage();
    }
}

function prevImage() {
    if (!state.currentPost || !state.currentPost.images) return;
    if (state.currentImageIndex > 0) {
        state.currentImageIndex--;
        updateModalImage();
    }
}

// 키보드 이벤트 연동
document.addEventListener("keydown", e => {
    if (!el.modal.classList.contains("active")) return;
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
});

function closeModal() {

    console.log("closeModal called");

    el.modal.classList.remove("active");

    document.body.style.overflow = "";

    state.currentPost = null;

    state.currentImageIndex = 0;

    hideMobileOverlay();

}

function bindStaticEvents() {

    // Filter

    el.filterButtons.forEach(button => {

        button.addEventListener("click", e => {

            e.preventDefault();

            el.filterButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            state.filter =
                button.dataset.filter;

            state.visibleCount = 20;

            hideMobileOverlay();

            render();

        });

    });

    // Load More

    if (el.loadMore) {

        el.loadMore.addEventListener("click", () => {

            state.visibleCount += 20;

            render();

        });

    }

    // Close Button (수정된 이벤트 위임 및 바인딩)

    if (el.modalClose) {

        el.modalClose.addEventListener("click", function (e) {

            console.log("click X button");
            e.preventDefault();
            e.stopPropagation();

            closeModal();

        });

    }

    // Background Click

    if (el.modal) {

        el.modal.addEventListener("click", function (e) {

            if (e.target === el.modal) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            }

        });

    }

    // ESC (수정: 전파를 확실하게 방지하여 main.js 가 동작하지 않도록 제어)

    document.addEventListener("keyup", e => {

        if (e.key === "Escape") {
            if (el.modal.classList.contains("active")) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            }
        }

    }, true); // 캡처링 모드 적용하여 상위 이벤트보다 먼저 실행

    // Mobile Outside Click

    document.addEventListener("click", e => {

        if (window.innerWidth > 736)
            return;

        if (e.target.closest(".portfolio-item"))
            return;

        if (el.modal.classList.contains("active"))
            return;

        hideMobileOverlay();

    });

}

// =============================
// Utility
// =============================

function getPostById(id) {

    return state.posts.find(post => post.id == id);

}

function resetModal() {

    el.modalImage.removeAttribute("src");

    el.modalCaption.textContent = "";

    el.modalInstagram.removeAttribute("href");

}

// =============================
// Window Resize
// =============================

window.addEventListener("resize", () => {

    if (window.innerWidth > 736) {

        hideMobileOverlay();

    }

});



let touchStartX = 0;

let touchEndX = 0;

el.modal?.addEventListener("touchstart", e => {

    touchStartX = e.changedTouches[0].clientX;

});

el.modal?.addEventListener("touchend", e => {

    touchEndX = e.changedTouches[0].clientX;

    if (!state.currentPost)
        return;

    const diff =
        touchStartX - touchEndX;

    if (Math.abs(diff) < 60)
        return;

    if (diff > 0) {

        nextImage();

    }

    else {

        prevImage();

    }

});

// =============================
// Future Keyboard
// =============================

document.addEventListener("keydown", e => {

    if (!state.currentPost)
        return;

    if (e.key === "ArrowRight") {

        nextImage();

    }

    if (e.key === "ArrowLeft") {

        prevImage();

    }

});

// =============================
// End
// =============================

console.log(
    "Portfolio initialized successfully."
);