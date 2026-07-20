const visionTabs = document.querySelectorAll("[data-vision-tab]");
const visionPanels = document.querySelectorAll("[data-vision-panel]");

function setVisionPanel(target) {
  visionTabs.forEach((tab) => {
    const isActive = tab.dataset.visionTab === target;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  visionPanels.forEach((panel) => {
    const isActive = panel.dataset.visionPanel === target;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

visionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setVisionPanel(tab.dataset.visionTab);
  });
});

if (window.location.hash === "#roadmap") {
  setVisionPanel("roadmap");
}

const countdown = document.querySelector("[data-countdown-target]");

if (countdown) {
  const targetTime = new Date(countdown.dataset.countdownTarget).getTime();
  const units = {
    days: countdown.querySelector('[data-countdown-unit="days"]'),
    hours: countdown.querySelector('[data-countdown-unit="hours"]'),
    minutes: countdown.querySelector('[data-countdown-unit="minutes"]'),
    seconds: countdown.querySelector('[data-countdown-unit="seconds"]'),
  };

  function pad(value, size = 2) {
    return String(value).padStart(size, "0");
  }

  function updateCountdown() {
    const remaining = Math.max(0, targetTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    units.days.textContent = pad(days, 3);
    units.hours.textContent = pad(hours);
    units.minutes.textContent = pad(minutes);
    units.seconds.textContent = pad(seconds);
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}
