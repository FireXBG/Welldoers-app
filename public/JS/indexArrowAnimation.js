window.addEventListener('load', animate);
function animate() {
    gsap.to('.arrow-down', {
        y: -10,
        ease: 'power2.out',
        duration: 1,
        repeat: -1,
        yoyo: true,
    })
}