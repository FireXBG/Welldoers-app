/* buttons */

let individualBtn = document.querySelector('#individual');
let groupsBtn = document.querySelector('#groups');
let dealsBtn = document.querySelector('#deals');

/* sections */

let individualSection = document.querySelector('.individual');
let groupsSection = document.querySelector('.groups');
let dealsSection = document.querySelector('.deals');

/* listen for a click */

individualBtn.addEventListener('click', loadIndividuals);
groupsBtn.addEventListener('click', loadGroups);
dealsBtn.addEventListener('click', loadDeals);

/* change options and animate */


function loadIndividuals() {
    groupsSection.style.opacity = '0';
    dealsSection.style.opacity = '0';

    setTimeout(() => {
        groupsSection.style.display = 'none';
        dealsSection.style.display = 'none';
        individualSection.style.display = 'flex';
    }, 500);
    setTimeout(() => {
        individualSection.style.opacity = '1';
    }, 1000);
    setTimeout(() => {
        individualBtn.style.borderBottom = 'solid 0.2rem black'
        groupsBtn.style.borderBottom = 'none'
        dealsBtn.style.borderBottom = 'none'
    }, 200);
}

function loadGroups() {
    individualSection.style.opacity = '0';
    dealsSection.style.opacity = '0';

    setTimeout(() => {
        individualSection.style.display = 'none';
        dealsSection.style.display = 'none'
        groupsSection.style.display = 'flex';
    }, 500);
    setTimeout(() => {
        groupsSection.style.opacity = '1'
    }, 1000);
    setTimeout(() => {
        individualBtn.style.borderBottom = 'none'
        groupsBtn.style.borderBottom = 'solid 0.2rem black'
        dealsBtn.style.borderBottom = 'none'
    }, 200);
}

function loadDeals() {
    individualSection.style.opacity = '0';
    groupsSection.style.opacity = '0';

    setTimeout(() => {
        individualSection.style.display = 'none';
        groupsSection.style.display = 'none';
        dealsSection.style.display = 'flex'
    }, 500);
    setTimeout(() => {
        dealsSection.style.opacity = '1';
    }, 1000);
    setTimeout(() => {
        individualBtn.style.borderBottom = 'none'
        groupsBtn.style.borderBottom = 'none'
        dealsBtn.style.borderBottom = 'solid 0.2rem black'
    }, 200);
}