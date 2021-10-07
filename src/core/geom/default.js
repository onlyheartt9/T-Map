import {
  Fill,
  RegularShape,
  Stroke,
  Style,
  Circle as CircleStyle,
  Text
} from 'ol/style';
import { getStyleObject } from "@/core/style/index.js"
// 矢量点位默认的图标样式
function getDefaultVectorStyles() {
  const style = getStyleObject({
    image: {
      type: "circle",
      radius: 7,
      fill: { color: "black" },
      stroke: { color: "white", width: 2 }
    }
  });
  return style;
}

// 聚合图层                                                                                                                1
export function getDefaultClusterStyle(size) {
  return new Style({
    image: new CircleStyle({
      radius: 15,
      stroke: new Stroke({
        color: '#fff',
      }),
      fill: new Fill({
        color: '#3399CC',
      }),
    }),
    text: new Text({
      text: size.toString(),
      fill: new Fill({
        color: '#fff',
      }),
    }),
  });
};

export const VectorStyles = getDefaultVectorStyles();