import Feature from "ol/Feature";
import { clone } from "@/utils/index.js";
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from "ol/style";
import { getStyleConfig, getStyleObject } from "@/core/style/index.js"

// 封装feature工具类，获取feature相关数据
export class TFeature {
  constructor(feature) {
    this._feature = feature;
  }

  getStyle() {
    const style = this._feature.getStyle();
    return getStyleConfig(style)
  }

  setStyle(config = {}) {
    this._feature.setStyle(null);
    const style = getStyleObject(config);
    this._feature.setStyle(style);
  }
}

function getImageConfig(image) {
  let imageConf = {};
  if (image instanceof CircleStyle) {
    const fill = clone(image.fill_);
    const stroke = clone(image.stroke_);
    imageConf = { type: "circle", fill, stroke, radius: image.radius_ };
  } else {
    imageConf = { type: "icon", src: image.getSrc() };
  }
  return imageConf;
}


// 隐藏点位方法
Feature.prototype.setVisible = function (key) {
  // 状态值相同不执行任何操作
  if(key===this._visible){
    return
  }
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
