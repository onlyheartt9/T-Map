import { Control } from 'ol/control';
export class RotateNorthControl extends Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
      const options = opt_options || {}; 
  
      const button = document.createElement('button');
      button.innerHTML = 'N';
  
      const element = document.createElement('div');
      element.className = 'rotate-north ol-unselectable ol-control';
      element.appendChild(button);
  
      super({
        element: element,
        target: options.target,
      });
  
      button.addEventListener('click', this.handleRotateNorth.bind(this), false);
    }
  
    handleRotateNorth() {
      console.log(this.getMap())
    }
  }