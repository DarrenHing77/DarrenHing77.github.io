document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".dropdown").forEach(dropdown => {
        dropdown.addEventListener("click", function (event) {
            event.stopPropagation();
            this.querySelector(".dropdown-content").classList.toggle("show");
        });
    });

    window.addEventListener("click", function () {
        document.querySelectorAll(".dropdown-content").forEach(menu => {
            menu.classList.remove("show");
        });
    });
});
