import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";
import { MAP_URL } from "@/constant/index.js";
import {
  TVectorLayer,
  TClusterLayer,
  TrailLayer,
  ClusterControl,
  VectorControl,
  TPolygonLayer,
} from "@/core/layers/index.js";
import { RotateNorthControl } from "@/core/control/index.js";
import { pointForEach } from "@/utils/index.js";
import Draw from "../layers/Draw.js";

// 封装好的对应图层
const _controlLayer = {
  vector: VectorControl,
  cluster: ClusterControl,
};

// 封装好的对应图层
const _typeLayer = {
  vector: TVectorLayer,
  cluster: TClusterLayer,
  trail: TrailLayer,
  polygon: TPolygonLayer,
};

// 地图初始化方法
function _init(config = {}) {
  this._typeLayer = _typeLayer;
  this._controlLayer = _controlLayer;
  const {
    id = "map",
    center = [116.3, 39.9], // 中心点
    zoom = 10, // 初始化地图可视级别
    minZoom = 8, // 地图可视最小级别
    maxZoom = 17, // 地图可视最大级别
    extent = [70, 0, 140, 60], // 地图可视范围,
    onFinish = () => {},
    url = MAP_URL["gaode"],
  } = config;

  this.id = id;
  this._mapconfig = {
    id,
    center,
    zoom,
    minZoom,
    maxZoom,
    extent,
    url,
  };
  this._url = new XYZ({
    url: MAP_URL["gaode"],
  });

  this.map = new Map({
    controls: defaultControls().extend([new RotateNorthControl()]),
    target: id,
    layers: [
      new TileLayer({
        source: this._url,
      }),
    ],
  });

  this.setConfig();

  this.map._tlayers = [];

  // 添加feature点击事件
  const _click = (event) => {
    const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
      //feature.dispatchEvent({ type: "singleclick", event: event });
      return feature;
    });
    feature && feature.dispatchEvent({ type: "singleclick", event: event });
  };
  this.map.on("click", _click);
}

function setConfig(config) {
  this._mapconfig = { ...this._mapconfig, ...config };
  const { center, zoom, minZoom, maxZoom, extent, url } = this._mapconfig;
  this.setExtent(extent);
  this.setCenter(center);
  this.setZoom(zoom);
  this.setMinZoom(minZoom);
  this.setMaxZoom(maxZoom);
  this.setUrl(url);
}

function addLayer(opt = {}) {
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

  const layer = new this._typeLayer[type](opt);

  layer.bind(this.map);
  // 收集图层对象
  this.map._tlayers.push(layer);

  this.map.addLayer(layer.olLayer);

  return layer;
}

function addControlLayer(opt = {}) {
  const { type = "vector" } = opt;
  const layer = new this._controlLayer[type](opt);
  layer.bind(this.map);
  // 收集图层对象
  this.map._tlayers.push(layer);
  return layer;
}

function clearMap() {
  const tlayers = this.map._tlayers;
  tlayers.forEach((tlayer) => tlayer.destroy());
  // this.map._tlayers = [];
}

function addDraw(config) {
  const draw = new Draw(config);
  this.map._tlayers.push(draw);
  draw.bind(this.map);
  draw.reflash();
  return draw;
}

////////map配置设置
function setCenter(center) {
  this.map.getView().setCenter(center);
}
function setZoom(zoom) {
  this.map.getView().setZoom(zoom);
}
function setMaxZoom(zoom) {
  this.map.getView().setMaxZoom(zoom);
}
function setMinZoom(zoom) {
  this.map.getView().setMinZoom(zoom);
}
function setExtent(extent) {
  const oldView = this.map.getView();
  const center = oldView.getCenter();
  const zoom = oldView.getZoom();
  const minZoom = oldView.getMinZoom();
  const maxZoom = oldView.getMaxZoom();
  const view = new View({
    center,
    zoom,
    extent,
    minZoom,
    maxZoom,
    projection: "EPSG:4326",
  });
  this.map.setView(view);
}

function getExtent(){
  return this.map.getView().calculateExtent()
}

function setUrl(url) {
  this._url.setUrl(url);
}

function getLayerByName(layername) {
  return this.map._tlayers.find((layer) => layer.className === layername);
}

export {
  _init,
  setConfig,
  addLayer,
  addControlLayer,
  addDraw,
  setCenter,
  setZoom,
  setMaxZoom,
  setMinZoom,
  setExtent,
  setUrl,
  getLayerByName,
  getExtent,
  clearMap,
};
