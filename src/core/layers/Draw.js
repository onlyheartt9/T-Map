import TObject from "@/utils/Object.js";
import Draw, { createBox } from "ol/interaction/Draw";
import { Vector as VectorSource } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import { warn } from "@/utils/index.js";
import WKT from "ol/format/WKT";
import { Style, Fill, Stroke } from "ol/style";
import Point from "ol/geom/Point";
import Feature, { TFeature } from "@/core/feature/index.js";
import { dealTrailPoints, getTrailMarker } from "@/core/layers/Trail.js";

export default class TDrawLayer extends TObject {
  constructor(opt = {}) {
    super(opt);
    const { isHightLight, style } = opt;
    this._isHightLight = isHightLight;
    this.styles = null;
    this._type = "normal";
    // 高亮feature
    this._feature = null;

    this._initStyles();
  }

  _initStyles() {
    const trailStyle = getTrailMarker();
    this.styles = { ...trailStyle };
  }

  _defaultStyle() {
    return new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5],
      }),
      stroke: new Stroke({
        color: [68, 182, 239, 1],
        width: 2,
      }),
    });
  }

  // 点击事件
  _click(feature) {
    if (this._type !== "normal") {
      return;
    }
    const tf = new TFeature(feature);
    if (this._isHightLight) {
      this._setHightLight(feature);
    }
    this.target("click", tf);
  }

  // 设置高亮
  _setHightLight(feature) {
    const features = this.getFeatures();
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const stroke = f.getStyle().getStroke();
      let width = stroke.getWidth();
      if (f === feature && !f.isHightLight) {
        width += 3;
        f.isHightLight = true;
      } else if (f.isHightLight && f !== feature) {
        width -= 3;
        f.isHightLight = false;
      }
      stroke.setWidth(width);
      f.notify();
    }
  }

  // 绘制图形完成，初始化样式
  _initFeature(feature, target) {
    const mode = target.mode_;
    feature.setStyle(this._defaultStyle());
    if (mode === "LineString") {
      const points = feature.getGeometry().getCoordinates();
      const { markers } = dealTrailPoints.call(this,points,true);
      this._source.addFeatures(markers);
    }
  }

  // 创建图层
  _init() {
    const self = this;
    this._source = new VectorSource({ wrapX: false });
    this.olLayer = new VectorLayer({
      source: this._source,
      style: function (feature) {
        const style = self.styles[feature.get("_type")];
        feature.setStyle(style)
      },
    });
    this.olLayer.setZIndex(500);
    this.map.addLayer(this.olLayer);
  }

  // 根据类型，开启绘制图形
  draw(value) {
    if (!value) {
      warn("开启绘制需要设置参数");
      return;
    }
    this.close();
    this._type = value;
    let geometryFunction;
    if (value === "Polygon") {
      value = "Polygon";
      geometryFunction = null;
    } else if (value === "Box") {
      value = "Circle";
      geometryFunction = createBox();
    } else if (value === "Circle") {
      value = "Circle";
      geometryFunction = null;
    } else if (value === "Line") {
      value = "LineString";
      geometryFunction = null;
    }
    TDrawLayer.global = new Draw({
      source: this._source,
      type: value,
      // style: new Style({
      //   stroke: new Stroke({
      //     color: [68, 182, 239, 1],
      //     width: 5,
      //   }),
      // }),
      geometryFunction: geometryFunction,
    });
    window.aaa = TDrawLayer.global;

    // 注册绘制完成事件 ，并注册feature的点击事件
    TDrawLayer.global.on("drawend", (e) => {
      console.log(e);
      const { feature, target } = e;
      this._initFeature(feature, target);
      const tf = new TFeature(feature);
      this.target("drawend", tf);
      feature.on("singleclick", () => {
        this._click(feature);
      });
    });
    this.map.addInteraction(TDrawLayer.global);
  }

  // 获取所有图形对象
  getFeatures() {
    const features = this._source.getFeatures();
    return features;
  }
  // 转化为WKT格式
  getJson() {
    return this.writeFeatures(this.getFeatures());
  }

  readJson(str) {
    const features = this.readFeatures(str);
    features.forEach((feature) => {
      feature.on("singleclick", () => {
        this._click(feature);
      });
    });

    this._source.addFeatures(features);
  }

  // 刷新图层，创建新图层，删除旧图层
  reflash() {
    if (this.olLayer) {
      this.map.removeLayer(this.olLayer);
    }
    this.close();
    this._init();
  }

  // 撤回上一个已绘制的图形
  removeLastFeature() {
    const features = this._source.getFeatures();
    this._source.removeFeature(features[features.length - 1]);
  }

  // 撤销上一个绘制的点位操作
  removeLastPoint() {
    TDrawLayer.global.removeLastPoint();
  }

  //关闭绘制状态
  close() {
    this._type = "normal";
    this.map.removeInteraction(TDrawLayer.global);
  }

  destroy() {}
}

TDrawLayer.global = null;
