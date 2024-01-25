const pElements = document.querySelectorAll(".nav-a p");
toggleMenu();

window.addEventListener("resize", toggleMenu);

function toggleMenu() {
  if (window.innerWidth < 1000) {
    pElements.forEach((p) => {
      p.style.display = "none";
    });
  } else {
    pElements.forEach((p) => {
      p.style.display = "block";
    });
  }
}
