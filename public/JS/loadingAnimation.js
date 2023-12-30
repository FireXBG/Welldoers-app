window.addEventListener("load", animateScreen);
function removeLoadingScreen() {
  const loadingScreen = document.querySelector(".loading-container");
  setTimeout(() => {
    loadingScreen.style.transition = "500ms";
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
    }, 50);
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }, 500);
}

function animateScreen() {
  let loadingImage = document.querySelector(".loading-container img");
  setTimeout(() => {
    gsap.to(loadingImage, {
      scaleX: -1,
      duration: 0.4,
      ease: "in-out",
      repeat: 1,
      yoyo: true,
      onComplete: function () {
        removeLoadingScreen();
        animateText();
      },
    });
  }, 500);
}
