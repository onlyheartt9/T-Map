import {
  Fill,
  RegularShape,
  Stroke,
  Style,
  Circle as CircleStyle,
  Text
} from 'ol/style';
// 矢量点位默认的图标样式
function getDefaultVectorStyles() {
  const stroke = new Stroke({ color: "black", width: 1 });
  const style = new Style({
    image: new RegularShape({
      fill: new Fill({ color: "green" }),
      stroke: stroke,
      points: 5,
      radius: 80,
      radius2: 4,
      angle: 0,
    }),
  });
  const styles = [
    {
      type: "defalut",
      value: style,
    },
  ];
  return styles;
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