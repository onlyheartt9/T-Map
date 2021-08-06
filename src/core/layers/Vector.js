import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { VectorStyles } from "@/core/geom/default";
import TLayer from "./BaseLayer";

class TVectorLayer extends TLayer {
  constructor(opt) {
    super(opt);
    const { styles = [] } = opt;
    this.olLayer = this.createLayer(opt);
    this.styles = {};
    this.initStyle(styles.concat(VectorStyles));
  }

  initStyle(styles) {
    styles.forEach((s) => {
      this.styles[s.type] = s.value;
    });
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
    return vectorLayer;
  }

  addPoint({ coord, type="defalut" }) {
    const feature = new Feature(new Point(coord));
    feature.setStyle(this.styles[type]);
    const source = new VectorSource({
      features: [feature],
    });
    this.olLayer.setSource(source);
  }
}
export default TVectorLayer;
