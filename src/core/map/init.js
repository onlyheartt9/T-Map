import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import "./style.css";
import { defaults as defaultControls } from "ol/control";

import { MAP_URL } from "@/constant/index.js";
import {
  TVectorLayer,
  TClusterLayer,
  TrailLayer,
  ClusterControl,
  VectorControl,
} from "@/core/layers/index.js";
import { RotateNorthControl } from "@/core/control/index.js";
import { pointForEach } from "@/utils/index.js";
import Draw from "../layers/Draw.js";
import * as Methods from "./methods"

// 引用初始化TMap相关方法
export function initMixin(TMap) {
  const methods = Object.keys(Methods);
  
  methods.forEach(method=>{
    TMap.prototype[method] = Methods[method];
  })
  
}

// 工具类相关方法扩展

export function initUtils() {
  Array.prototype.pointForEach = pointForEach;
}
