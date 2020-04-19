const template = document.createElement('template');
template.innerHTML = `
<style>
button {
  background: var(--background);
  color: var(--color);
  padding: var(--padding-y) var(--padding-x);
  font-size: var(--font-size);
  border-radius: var(--border-radius);
  border: 0;
  cursor:pointer;
  transition: background .2s ease-in-out;
  position: relative;
  transition:all .2s ease-in-out;
  font-family: var(--font-family);
  font-weight:400;
}
button:hover {
  background: var(--background-hover);
}
button:active,
button:focus {
  outline:none
}
button:disabled {
  opacity:0.75;
  pointer-events: none
}
button.counting{
  background: var(--background-active);
}
button.counting .progress-ring{
  position:absolute;
  right:calc(var(--padding-x) / 2);
  top:0;
  bottom:0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
button:not(.counting) .progress-ring{
  display:none
}
.progress-ring svg{
  opacity:0.75
}
</style>
<button>
  <slot name="text"></slot>
  <div class="progress-ring"></div>
</button>
`;

class TimerButton extends HTMLElement {

  defaultRadius = 16;
  defaultStroke = 4;

  constructor() {
    super();

    this.timer = this.getAttribute('time') || 5;
    const radius = this.getAttribute('radius') || this.defaultRadius;
    const stroke = this.getAttribute('stroke') || this.defaultStroke;
    const normalizedRadius = (stroke * 2 < radius) ? radius - stroke * 2 : radius - this.defaultStroke * 2;
    this.circumference = normalizedRadius * 2 * Math.PI;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.progressRing = this.shadowRoot.querySelector('.progress-ring');
    this.progressRingHTML = `
      <svg
        height="${radius * 2}"
        width="${radius * 2}"
       >
         <circle
           stroke="white"
           stroke-dasharray="${this.circumference} ${this.circumference}"
           style="stroke-dashoffset:${this.circumference}"
           stroke-width="${stroke}"
           fill="transparent"
           r="${normalizedRadius}"
           cx="${radius}"
           cy="${radius}"
        />
      </svg>
      <style>
        circle {
          transition: stroke-dashoffset 0.35s;
          transform: rotate(-90deg) scale(1,-1);
          transform-origin: 50% 50%;
        }
      </style>
    `;

    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => {
      let that = this;
      that.progress = 0;
      const button = that.shadowRoot.querySelector('button');
      that.progressRing.innerHTML = that.progressRingHTML;
      const circle = that.shadowRoot.querySelector('circle');
      if (!that.interval) {
        button.classList.add('counting');
        button.style.paddingRight = `${(radius * 3)}px`;
        that.interval = setInterval(() => {
          that.progress += 1;
          const offset = that.circumference - (that.progress / 100 * that.circumference);
          circle.style.strokeDashoffset = offset;
          if (that.progress === 100) {
            setTimeout(() => {
              button.classList.remove('counting');
              button.style.removeProperty('padding-right');
              that.progressRing.innerHTML = null;
            }, 250);
            clearInterval(that.interval);
            that.interval = null;
          }
        }, (that.timer * 10));
      } else {
        button.classList.remove('counting');
        button.style.removeProperty('padding-right');
        that.progressRing.innerHTML = null;
        clearInterval(that.interval);
        that.interval = null;
      }
    });
  }

}

window.customElements.define('timer-button', TimerButton);