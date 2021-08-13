import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style } from 'ol/style';
// 隐藏点位方法
Feature.prototype.setVisible = function (key) {
  this._visible = key;
  if (key) {
    const style = this.bak_style;
    delete this.bak_style;
    this.setStyle(style);
    return
  }
  this.bak_style = this.getStyle();
  this.setStyle(this._blank);
};

// 设置隐藏对象的空白样式
Feature.prototype._blank = new Style({ text: "" });

Feature.prototype.setCoordinates = function (coord) {
  this.getGeometry().setCoordinates(coord)
};

Feature.prototype.getCoordinates = function () {
  return this.getGeometry().getCoordinates()
};

export default Feature;