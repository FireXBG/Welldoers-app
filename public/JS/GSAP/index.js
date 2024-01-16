const wakerImage = document.querySelector(".welcome-section-img");

gsap.from(wakerImage, {
  duration: 5,
  x: -500,
  y: -100,
  scaleX: 0.9,
  scaleY: 0.9,
  ease: "power1.out",
  scrollTrigger: {
    trigger: wakerImage,
    start: "top 80%",
    end: "top 0%",
    scrub: 1,
  },
});
