import Feature from "ol/Feature";
import { clone } from "@/utils/index.js";
import { Style, Fill, Stroke } from "ol/style";

// 封装feature工具类，获取feature相关数据
export class TFeature {
  constructor(feature) {
    this._feature = feature;
  }

  getStyle() {
    const style = this._feature.getStyle();
    const { fill_, stroke_ } = style;
    const fill = clone(fill_);
    const stroke = clone(stroke_);
    return {
      fill,
      stroke,
    };
  }

  setStyle(config = {}) {
    this._feature.setStyle(null);
    const style = getStyleObject(config);
    this._feature.setStyle(style);
  }
}

// 根据json获取style对象
export function getStyleObject(config) {
  const style = new Style();
  const { fill, stroke } = config;

  if (fill) {
    style.setFill(new Fill(fill));
  }
  if (stroke) {
    delete stroke.lineDash;
    style.setStroke(new Stroke(stroke));
  }
  return style;
}

// 隐藏点位方法
Feature.prototype.setVisible = function (key) {
  this._visible = key;
  if (key) {
    const style = this.bak_style;
    delete this.bak_style;
    this.setStyle(style);
    return;
  }
  this.bak_style = this.getStyle();
  this.setStyle(this._blank);
};

// 设置隐藏对象的空白样式
Feature.prototype._blank = new Style({ text: "" });

Feature.prototype.setCoordinates = function (coord) {
  this.getGeometry().setCoordinates(coord);
};

Feature.prototype.getCoordinates = function () {
  return this.getGeometry().getCoordinates();
};

export default Feature;
