import RobotWindow from 'https://cyberbotics.com/wwi/R2023b/RobotWindow.js';

/* global sendBenchmarkRecord, showBenchmarkRecord, showBenchmarkError */

// modal pop-up box code

const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick); 

function setSuccessMessage(benchmarkName, benchmarkPerformanceString) {
  document.querySelector(".text").innerHTML = `
  <h2>${benchmarkName} complete</h2>
  <h3>Congratulations you finished the benchmark!</h3>
  <p>Your final time is: <b style="color:green;">${benchmarkPerformanceString}</b></p>
  <p>If you want to submit your controller to the leaderboard, follow the instructions given by the "Register" button on the benchmark page.</p>
  `;
}

window.robotWindow = new RobotWindow();
const benchmarkName = 'Inverted Pendulum';
let timeString;

window.robotWindow.receive = function(message, robot) {
  if (message.startsWith('timeString_')) {
    timeString = message.split('_')[1];
    document.getElementById('time-display').innerHTML = timeString;
  } else if (message.startsWith('force:')) {
    const f = parseFloat(message.substr(6));
    document.getElementById('force-display').innerHTML = f.toFixed(2);
  } else if (message.startsWith('success:')) {
    const newMessage = message.replace('success', 'confirm');
    document.getElementById('time-display').style.color = 'green';
    this.send(newMessage)
    setSuccessMessage(benchmarkName, message.split('_')[1]);
    toggleModal();
  } else
    console.log("Received unknown message for robot '" + robot + "': '" + message + "'");
};

window.addEventListener('load', (event) => {
  if (document.readyState === 'complete' && navigator.userAgent.indexOf('Chrome') > -1) {
    // use MathJax to correctly render MathML not natively supported by Chrome
    let script = document.createElement('script');
    script.setAttribute('type','text/javascript');
    script.setAttribute('id','MathJax-script');
    script.setAttribute('async','');
    script.setAttribute('src','https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js');
    document.head.appendChild(script);
  }
});
