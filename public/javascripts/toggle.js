const toggleButton = document.querySelector(".toggle");

const body = document.body;
const navbarLinks = document.querySelector(".col-sm-2");

toggleButton.addEventListener("click", () => {
  navbarLinks.classList.toggle("active");
  body.classList.toggle("sidebar");

  if (body.classList.contains("sidebar")) {
    closeNav();
    // navbarLinks.style.width = "75%";
  } else {
    openNav();
  }
});

function openNav() {
  navbarLinks.style.left = "-100%";
}

function closeNav() {
  navbarLinks.style.left = "0";
}
