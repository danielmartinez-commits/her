const gate = document.getElementById("gate");
const place = document.getElementById("place");
const enterButton = document.getElementById("enterButton");
const song = document.getElementById("song");
const soundControl = document.getElementById("soundControl");
const soundText = document.getElementById("soundText");
const modal = document.getElementById("memoryModal");
const closeMemory = document.getElementById("closeMemory");
const cursorGlow = document.querySelector(".cursor-glow");

let audioReady = false;

enterButton.addEventListener("click", async () => {
  gate.classList.add("exit");
  document.body.classList.add("entered");
  place.classList.add("visible");
  place.setAttribute("aria-hidden", "false");

  // Browsers allow audio after a direct user interaction.
  try {
    await song.play();
    audioReady = true;
    soundControl.classList.remove("paused");
    soundText.textContent = "sonando";
  } catch (error) {
    // If the local MP3 is not present, the visual experience still works.
    audioReady = false;
    soundControl.classList.add("paused");
    soundText.textContent = "sin audio";
  }

  revealDrawers();
});

function revealDrawers() {
  const drawers = document.querySelectorAll(".drawer");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = [...drawers].indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(index * 90, 450)}ms`;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  drawers.forEach(drawer => observer.observe(drawer));
}

soundControl.addEventListener("click", async () => {
  if (!audioReady && song.paused) {
    try {
      await song.play();
      audioReady = true;
    } catch {
      soundText.textContent = "añade el mp3";
      return;
    }
  }

  if (song.paused) {
    await song.play();
    soundText.textContent = "sonando";
    soundControl.classList.remove("paused");
  } else {
    song.pause();
    soundText.textContent = "pausado";
    soundControl.classList.add("paused");
  }
});

document.querySelectorAll(".open-memory").forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    document.querySelectorAll(".memory-view").forEach(view => {
      view.classList.remove("active");
    });

    const target = document.getElementById(targetId);
    if (target) target.classList.add("active");

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  const video = document.getElementById("memoryVideo");
  if (video) video.pause();
}

closeMemory.addEventListener("click", closeModal);
document.querySelector(".modal-backdrop").addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

window.addEventListener("mousemove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

window.addEventListener("touchstart", () => {
  cursorGlow.style.display = "none";
}, { once: true });

// Gracefully handle a missing local video.
const video = document.getElementById("memoryVideo");
const videoEmpty = document.querySelector(".video-empty");

video.addEventListener("loadeddata", () => {
  videoEmpty.style.opacity = "0";
  videoEmpty.style.pointerEvents = "none";
});

video.addEventListener("error", () => {
  videoEmpty.style.opacity = "1";
  videoEmpty.style.pointerEvents = "auto";
});

// Small parallax on desktop; intentionally restrained so the page feels slow,
// not like a casino website.
window.addEventListener("scroll", () => {
  if (window.innerWidth < 780) return;
  const y = window.scrollY;
  const intro = document.querySelector(".intro");
  if (intro) {
    intro.style.transform = `translateY(${Math.min(y * 0.045, 35)}px)`;
  }
}, { passive: true });
