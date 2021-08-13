import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import 'ol/ol.css';
import './style.css'
import { defaults as defaultControls } from 'ol/control';

import { MAP_URL } from "@/constant";
import { TVectorLayer, TClusterLayer,ClusterControl ,VectorControl} from "@/core/layers"
import { RotateNorthControl } from "@/core/control"



// 引用初始化TMap相关方法
export function initMixin(TMap) {
  // 地图初始化方法
  TMap.prototype._init = function (config={}) {
    const {
      center = [116.3, 39.9],// 中心点
      zoom = 10,  // 初始化地图可视级别
      minZoom = 8,  // 地图可视最小级别
      maxZoom = 17, // 地图可视最大级别
      extent=[70,0,140,60] // 地图可视范围
    } = config;

    this.map = new Map({
      controls: defaultControls().extend([new RotateNorthControl()]),
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: MAP_URL["gaode"],
          }),
        }),
      ],
      view: new View({
        center,
        zoom,
        extent,
        minZoom,
        maxZoom,
        projection: 'EPSG:4326'
      }),
    });
  };

  // 封装好的对应图层
  TMap.prototype._typeLayer = {
    "vector": TVectorLayer,
    "cluster": TClusterLayer
  }

  TMap.prototype.addLayer = function (opt = {}) {
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
      properties // 任意可观察的属性。可以通过#get()和访问#set()
    } = opt;
    
    const layer = new this._typeLayer[type](opt);

    layer.bind(this.map);

    this.map.addLayer(layer.olLayer);

    return layer;
  }

  TMap.prototype.addClusterLayer = function (){
      const layer = new ClusterControl();
      layer.bind(this.map);
      return layer
  }
  TMap.prototype.addVectorLayer = function (){
      const layer = new VectorControl();
      layer.bind(this.map);
      return layer
  }
}
