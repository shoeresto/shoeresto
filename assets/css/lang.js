function setLanguage(lang) {
    localStorage.setItem("shoeresto_lang", lang);

    switch(lang) {
        case "ko":
            window.location.href = "/";
            break;

        case "en":
            window.location.href = "/en/";
            break;

        case "zh":
            window.location.href = "/cn/";
            break;
    }
}

document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.addEventListener("click", function(e) {
        e.preventDefault();
        setLanguage(this.dataset.lang);
    });
});