const timeNode = document.querySelector("#currentTime");
const alerts = Array.from(document.querySelectorAll(".case-alert"));
const pins = Array.from(document.querySelectorAll(".risk-pin"));
const labels = Array.from(document.querySelectorAll(".risk-label"));

function pad(value) {
  return String(value).padStart(2, "0");
}

function renderTime() {
  if (!timeNode) return;
  const now = new Date();
  timeNode.textContent = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function focusCase(index) {
  alerts.forEach((alert, alertIndex) => {
    alert.classList.toggle("active", alertIndex === index);
  });
  pins.forEach((pin, pinIndex) => {
    pin.classList.toggle("focus", pinIndex === index);
  });
  labels.forEach((label, labelIndex) => {
    label.classList.toggle("focus", labelIndex === index);
  });
}

alerts.forEach((alert, index) => {
  alert.addEventListener("click", () => focusCase(index));
});

let activeCase = 0;
window.setInterval(() => {
  activeCase = (activeCase + 1) % Math.min(alerts.length, pins.length);
  focusCase(activeCase);
}, 3600);

renderTime();
window.setInterval(renderTime, 1000);
focusCase(0);
