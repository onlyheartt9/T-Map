import Mapping from "./Mapping.js";
import GeoJSON from "ol/format/EsriJSON";
import FeatureFormat from "ol/format/Feature";
import { TFeature } from "@/core/feature/index.js";
import { getStyleObject } from "@/core/style/index.js"
const json = new GeoJSON();
export default class BaseObject extends Mapping {
  constructor(opt = {}) {
    const { mapping } = opt;
    super(mapping);
    this._values = null;
    this._listeners = null;
  }

  bind(map) {
    this.map = map;
  }

  get(key) {
    let value;
    if (this._values && this._values.hasOwnProperty(key)) {
      value = this._values[key];
    }
    return value;
  }

  getKeys() {
    return (this._values && Object.keys(this._values)) || [];
  }

  getProperties() {
    return (this._values && assign({}, this._values)) || {};
  }

  hasProperties() {
    return !!this._values;
  }
  // 触发listener
  target(key, ...e) {
    const listeners = this._listeners || (this._listeners = {});
    const ls = listeners[key];
    ls.forEach((l) => {
      l(...e);
    });
  }

  addListener(key, listener) {
    const listeners = this._listeners || (this._listeners = {});
    !listeners[key] && (listeners[key] = []);
    listeners[key].push(listener);
  }

  removeListener(key, listener) {
    const listeners = this._listeners || (this._listeners = {});
    const ls = listeners[key];
    if (!ls || ls.length === 0) {
      return;
    }
    listeners[key] = ls.filter((l) => l !== listener);
  }

  set(key, value) {
    const values = this._values || (this._values = {});
    values[key] = value;
  }

  setProperties(values) {
    for (const key in values) {
      this.set(key, values[key]);
    }
  }

  unset(key) {
    if (this._values && key in this._values) {
      delete this._values[key];
      if (isEmpty(this._values)) {
        this._values = null;
      }
    }
  }

  // 读取字符串，编译为对象，如果有样式，进行设置
  readFeatures(wktStr) {
    const features = json.readFeatures(wktStr);
    features.forEach((feature) => {
      const styleConfig = feature.get("_style");
      if (styleConfig) {
        const style = getStyleObject(styleConfig);
        console.log(style)
        feature.setStyle(style);
      }
    });
    return features;
  }

  writeFeatures(features) {
    features.forEach((feature) => {
      const tf = new TFeature(feature);
      const styleConfig = tf.getStyle();
      feature.set("_style", styleConfig);
    });

    return json.writeFeatures(features);
  }
}
