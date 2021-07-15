import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { MAP_URL } from "@/constant";
export function initMixin(TMap) {
  // 地图初始化方法
  TMap.prototype._init = function () {
    let config = {
      layers:[
        {
          url:"https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        }
      ],
      center:[0,0],
      zoom:2
    }
    this.map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: MAP_URL["gaode"],
          }),
        }),
      ],
      view: new View({
        center: [116.3, 39.9],
        zoom: 10,
        projection:'EPSG:4326'
      }),
    });
  };
}
