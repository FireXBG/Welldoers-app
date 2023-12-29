let button = document.querySelector('form button');
let menuCloseButton = document.querySelector('.close-popup')
let fader = document.querySelector('.pageFader');
let popup = document.querySelector('.emailResponse');
let resultText = document.querySelector('.resultText');
let resultSub = document.querySelector('.resultSub');
let loadingSubmit = document.querySelector('.loading-submit');
menuCloseButton.addEventListener('click', closePopup);
button.addEventListener('click', loadingButton);
window.addEventListener('DOMContentLoaded', checkResult);

function checkResult() {
    let response = false;
    let url = window.location.href;
    if(url.includes('/contacts?success=true')) {
        emailSuccess()
        response = true;
    } else if (url.includes('/contacts?success=false')){
        emailFailure()
        response = true;
    }

    if(response) {
        setTimeout(() => {
            openPopup();
        }, 500);
    }
}

function emailSuccess() {
    resultText.innerText = 'Успешно изпратено!';
    resultSub.innerText = 'Благодарим Ви за проявения интерес! Ще се свържем с Вас възможно най-скоро.'
}

function emailFailure() {
    resultText.innerText = 'Възникна грешка!';
    resultSub.innerText = 'Моля, опитайте отново или се свържете с нас на посочените контакти.'
}

function loadingButton() {
    loadingSubmit.style.display = 'flex !important';
    setTimeout(() => {
        loadingSubmit.style.opacity = '1';
    }, 10);
}

function openPopup() {
    popup.style.display = 'flex';
    fader.style.display = 'block';
        gsap.from(fader, {
            opacity: 0,
            duration: 1,
            delay: 0.5,
            onComplete: () => {
                fader.style.transition = '200ms';
            }
        })
        gsap.from(popup, {
            opacity: 0,
            duration: 1,
            delay: 0.5,
            onComplete: () => {
                popup.style.transition = '200ms';
            }
        })
}

function closePopup() {
    popup.style.opacity = '0';
    setTimeout(() => {
        fader.style.opacity = '0'
    }, 400);
        setTimeout(() => {
        fader.style.display = 'none'
        popup.style.display = 'none'
    }, 1000);
}