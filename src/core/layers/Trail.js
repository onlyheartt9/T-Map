import VectorLayer from "ol/layer/Vector";
import Feature from "@/core/feature/index.js";
import Polyline from "ol/format/Polyline";
import Point from "ol/geom/Point";
import { Cluster, Vector as VectorSource } from "ol/source";
import { getDefaultClusterStyle } from "@/core/geom/default.js";
import { toStringXY } from "ol/coordinate";
import LineString from "ol/geom/LineString";
import TLayer from "./BaseLayer";
import { getVectorContext } from "ol/render";
import {
  Fill,
  RegularShape,
  Stroke,
  Style,
  Icon,
  Circle as CircleStyle,
  Text,
} from "ol/style";
import { warn } from "@/utils/index.js";
import startIcon from "@/assets/image/icon.png"

function getNodeDistance(points) {
  let [x1, y1] = points[0];
  let length = 0;
  let cumulativeLengths = [0];
  for (var i = 1; i < points.length; i++) {
    let [x2, y2] = points[i];
    length += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    // count += length;
    cumulativeLengths.push(length);
    x1 = x2;
    y1 = y2;
  }
  return cumulativeLengths.map((l) => l / length);
}

/**
 * listener: onNode onMove onTarilEnd
 */
class TarilLayer extends TLayer {
  speed = 50;

  constructor(opt = {}) {
    super(opt);
    this.olLayer = this.createLayer(opt);
    this.styles = {};
    this.initStyles(opt);
  }

  initStyles(opt) {
    const { lineColor = "red", lineWidth = 6 } = opt;

    const route = new Style({
      stroke: new Stroke({
        width: lineWidth,
        color: lineColor,
      }),
    });
    const { icon, start, end, geoMarker } = getTrailMarker();
    this.styles = {
      route,
      icon,
      start,
      end,
      geoMarker,
    };
  }

  createLayer(opt) {
    const self = this;
    const vectorLayer = new VectorLayer({
      source: new VectorSource(),
      style: function (feature) {
        const style = self.styles[feature.get("_type")];
        feature.setStyle(style)
        //return self.styles[feature.get("_type")];
      },
    });
    return vectorLayer;
  }

  setTrailPoint(points) {
    const { markers, coords } = this._dealPoints(points);
    const ls = new LineString(coords);
    const routeFeature = new Feature({
      _type: "route",
      geometry: ls,
    });

    const position = markers[0].getGeometry().clone();
    const geoMarker = new Feature({
      _type: "geoMarker",
      geometry: position,
    });

    // 创建新source,添加到layer中
    const lastSource = this.olLayer.getSource();
    lastSource._stop && lastSource._stop();

    const source = new VectorSource();
    source.addFeatures([routeFeature, geoMarker, ...markers]);
    this.olLayer.setSource(source);
    this._setMove({ geoMarker, ls, source, points });
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  _dealPoints = dealTrailPoints;

  _setMove({ geoMarker, ls, source, points }) {
    let distance = 0;
    let lastTime;
    const nodeDistance = getNodeDistance(ls.getCoordinates());
    let nodeIndex = 0;
    let nextNode = nodeDistance[nodeIndex];
    const self = this;
    const position = geoMarker.getGeometry();
    const start_xy = position.getCoordinates();
    const vectorLayer = this.olLayer;

    function moveFeature(event) {
      const speed = self.speed;
      const time = event.frameState.time;
      const elapsedTime = time - lastTime;
      distance = (distance + (speed * elapsedTime) / 1e6) % 2;
      lastTime = time;
      // 判断是否到下个节点
      if (distance >= nextNode) {
        self.target("onNode", points[nodeIndex]);
        nodeIndex += 1;
        nextNode = nodeDistance[nodeIndex];
      }

      if (distance >= 1) {
        finishAnimation();
        return;
      }
      const currentCoordinate = ls.getCoordinateAt(distance);
      position.setCoordinates(currentCoordinate);
      const vectorContext = getVectorContext(event);
      vectorContext.setStyle(self.styles.geoMarker);
      vectorContext.drawGeometry(position);
      self.target("onMove", distance);
      // tell OpenLayers to continue the postrender animation
      self.map.render();
    }

    function finishAnimation() {
      nodeIndex = 0;
      nextNode = nodeDistance[0];
      self.target("onMove", 1);
      stopAnimation();
      setTimeout(() => {
        distance = 0;
        self.target("onTrailEnd");
        position.setCoordinates(start_xy);
      }, 500);
    }

    function startAnimation() {
      lastTime = Date.now();
      vectorLayer.on("postrender", moveFeature);
      geoMarker.setGeometry(null);
    }

    function stopAnimation() {
      geoMarker.setGeometry(position);
      vectorLayer.un("postrender", moveFeature);
    }
    // 更新source时，停止之前的操作
    source._stop = stopAnimation;

    // 对象上绑定start，stop方法
    this.start = startAnimation;
    this.stop = stopAnimation;
  }
}

// 根据轨迹点位,创建对应的节点点位对象
export function dealTrailPoints(points, key) {
  const coords = [];
  const markers = points.map((point) => {
    const marker = this.getFeatureObj(point, key);
    marker.set("_type", "icon");
    coords.push(marker.getCoordinates());
    return marker;
  });

  const startMarker = markers[0];
  startMarker.set("_type", "start");

  const endMarker = markers[markers.length - 1];
  endMarker.set("_type", "end");

  return { coords, markers };
}

export function getTrailMarker() {
  const icon = new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: "black" }),
      stroke: new Stroke({
        color: "white",
        width: 2,
      }),
    }),
  });

  const start = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: startIcon
    }),
  });

  const end = start;

  const geoMarker = new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: "black" }),
      stroke: new Stroke({
        color: "white",
        width: 2,
      }),
    }),
  });
  return { start, end, icon, geoMarker };
}

TarilLayer.prototype.name = "trail-layer";

export default TarilLayer;
