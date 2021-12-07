import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { VectorStyles } from "@/core/geom/default.js";
import TLayer from "./BaseLayer";
import { sameCoord, pointForEach } from "@/utils/index.js";
import { getVectorContext } from "ol/render";
import { easeOut } from "ol/easing";
import { Circle as CircleStyle, Stroke, Style } from "ol/style";
import { unByKey } from "ol/Observable";
import Polygon from "ol/geom/Polygon";

class TPolygonLayer extends TLayer {
  // 样式
  style = null;

  constructor(opt) {
    super(opt);
    this.olLayer = this.createLayer(opt);
  }

  createLayer(opt) {
    const {
      type = "vector",
      className, // 要设置为图层元素的 CSS 类名称。
      opacity, // 不透明度 (0, 1)。
      visible, // 能见度
      zIndex, // 图层渲染的 z-index。在渲染时，图层将被排序，首先是 Z-index，然后是位置。当 时undefined，zIndex对于添加到地图layers集合中Infinity的图层或使用图层的setMap() 方法时，假定a为 0
      minResolution, // 此图层可见的最小分辨率
      maxResolution, // 低于此图层将可见的最大分辨率
      minZoom, // 最小视图缩放级别（独占），高于该级别将显示此图层
      maxZoom, // 此图层可见的最大视图缩放级别
      properties, // 任意可观察的属性。可以通过#get()和访问#set()
    } = opt;
    const vectorLayer = new VectorLayer({
      ...opt,
    });
    const source = new VectorSource({
      features: [],
    });
    vectorLayer.setSource(source);
    this._source = source;
    return vectorLayer;
  }

  addPoints(coords) {
    const polygon = new Polygon(coords);
    this._add(polygon);
    this._source.addFeature(polygon);
  }
}

TPolygonLayer.prototype.name = "polygon-layer";

export default TPolygonLayer;
