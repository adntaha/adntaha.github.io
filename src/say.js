// Speaker buttons (.say, see the intro in home.js): click to play the clip in
// data-sound, click again to stop it. Nothing loads until the first click.

for (const button of document.querySelectorAll('.say')) {
  let audio = null;
  button.addEventListener('click', () => {
    if (!audio) {
      audio = new Audio(button.dataset.sound);
      audio.addEventListener('play', () => button.classList.add('is-playing'));
      audio.addEventListener('pause', () => button.classList.remove('is-playing')); // also fires when it ends
    }
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play();
    } else {
      audio.pause();
    }
  });
}
