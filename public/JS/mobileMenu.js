let closeButton = document.querySelector('.closeButton');
let openButton = document.querySelector('.openButton');
let menu = document.querySelector('.mobileMenu');
let links = document.querySelector('.links');
let reserveButton = document.querySelector('.links a:last-child');

openButton.addEventListener('click', openMenu)
closeButton.addEventListener('click', closeMenu);

function openMenu() {
    menu.style.width = '100%';
    links.style.display = 'flex';
    setTimeout(() => {
        links.style.opacity = '1';
    }, 100);
    reserveButton.style.display = 'flex';
    setTimeout(() => {
        reserveButton.style.opacity = '1';
    }, 100);
}

function closeMenu() {
    menu.style.width = '0';
    links.style.opacity = '0'
    setTimeout(() => {
        links.style.display = 'none';
    }, 100);
}