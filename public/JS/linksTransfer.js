const anchors = document.querySelectorAll('a');
const loadingScreen = document.querySelector('.loading-container');
anchors.forEach(anchor => {
  anchor.addEventListener('click', event => {
    event.preventDefault();
    loadingScreen.style.display = 'flex';
    setTimeout(() => {
        loadingScreen.style.opacity = '1';
    }, 100);
    setTimeout(() => {
      window.location.href = anchor.href;
    }, 1000);
  });
});

window.addEventListener('popstate', function(event) {
  if (event.state && event.state.reload) {
    location.reload();
  }
});
