import TObject from "@/utils/Object.js";
import { forEach } from "@/utils/index.js";
class TLayer extends TObject {
  // ol的图层
  olLayer = null;

  // 图层className
  className = "";

  _listeners = {};

  _styles = {};

  _types = {};


  constructor(opt = {}) {
    const { className } = opt;
    super(opt);
    this._opt = opt;
    this.className = className ?? this.name + "-" + TLayer._index++;
  }

  createLayer() {
    throw Error("forget init method: createLayer");
  }

  bind(map) {
    this.map = map;
  }

  destroy() {
    this.map.removeLayer(this.olLayer);
  }

  setVisible(key) {
    this.olLayer.setVisible(key);
  }

  //所有添加feature处理方法
  _add(feature) {
    const type = feature.get("_type");
    const isVisible =
      this._types[type] === undefined ? true : this._types[type];
    feature.setVisible(isVisible);
  }

  setVisibleByType(type, key) {
    this._types[type] = key;
    const source = this.olLayer.getSource();
    const features = source.getFeatures();
    console.log(features);
    forEach(features, (feature) => {
      const _type = feature.get("_type");
      if (type === _type) {
        feature.setVisible(key);
      }
    });
  }

  setZIndex(index) {
    this.olLayer.setZIndex(index);
  }
}
TLayer._index = 1;
export default TLayer;
