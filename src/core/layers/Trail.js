import VectorLayer from "ol/layer/Vector";
import Feature from "@/core/feature";
import Polyline from 'ol/format/Polyline';
import Point from "ol/geom/Point";
import { Cluster, Vector as VectorSource } from 'ol/source';
import { getDefaultClusterStyle } from "@/core/geom/default";
import { toStringXY } from 'ol/coordinate';
import LineString from 'ol/geom/LineString'
import TLayer from "./BaseLayer";
import { getVectorContext } from 'ol/render';
import {
  Fill,
  RegularShape,
  Stroke,
  Style,
  Icon,
  Circle as CircleStyle,
  Text
} from 'ol/style';
import { warn } from "@/utils/index";

class TarilLayer extends TLayer {

  constructor(opt = {}) {
    super(opt);
    this.olLayer = this.createLayer(opt);
    this.styles = {};
    this.initStyles(opt);
  }

  initStyles(opt) {
    const {
      lineColor = "red",
      lineWidth = 6
    } = opt;
    const styles = {
      'route': new Style({
        stroke: new Stroke({
          width: lineWidth,
          color: lineColor,
        }),
      }),
      'icon': new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'data/icon.png',
          // img:""
        }),
      }),
      'geoMarker': new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: 'black' }),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      }),
    };
    this.styles = styles;
  }

  createLayer(opt) {
    const self = this;
    const vectorLayer = new VectorLayer({
      source:new VectorSource(),
      style: function (feature) {
        return self.styles[feature.get('type')];
      },
    });
    return vectorLayer;
  }

  setTrailPoint(points) {

    const ls = new LineString(points);
    const routeFeature = new Feature({
      type: 'route',
      geometry: ls
    });
    const startMarker = new Feature({
      type: 'icon',
      geometry: new Point(points[0]),
    });
    const endMarker = new Feature({
      type: 'icon',
      geometry: new Point(points[points.length - 1]),
    });
    const position = startMarker.getGeometry().clone();
    const geoMarker = new Feature({
      type: 'geoMarker',
      geometry: position,
    });

    // 创建新source,添加到layer中
    const lastSource = this.olLayer.getSource();
    lastSource._stop&&lastSource._stop();
    
    const source = new VectorSource();
    source.addFeatures([routeFeature, geoMarker, startMarker, endMarker])
    this.olLayer.setSource(source);
    this._setMove({ geoMarker, ls ,source})
  }


  _setMove({ geoMarker, ls ,source}) {
    let distance = 0;
    let lastTime;
    const self = this;
    const position = geoMarker.getGeometry()
    const vectorLayer = this.olLayer;

    function moveFeature(event) {
      const speed = 50;
      const time = event.frameState.time;
      const elapsedTime = time - lastTime;
      distance = (distance + (speed * elapsedTime) / 1e6) % 2;
      lastTime = time;

      const currentCoordinate = ls.getCoordinateAt(
        distance > 1 ? 2 - distance : distance
      );
      position.setCoordinates(currentCoordinate);
      const vectorContext = getVectorContext(event);
      vectorContext.setStyle(self.styles.geoMarker);
      vectorContext.drawGeometry(position);
      // tell OpenLayers to continue the postrender animation
      self.map.render();
    }

    function startAnimation() {
      lastTime = Date.now();
      vectorLayer.on('postrender', moveFeature);
      geoMarker.setGeometry(null);
    }

    function stopAnimation() {
      geoMarker.setGeometry(position);
      vectorLayer.un('postrender', moveFeature);
    }
    // 更新source时，停止之前的操作
    source._stop = stopAnimation;

    // 对象上绑定start，stop方法
    this.start = startAnimation;
    this.stop = stopAnimation
  }
}

TarilLayer.prototype.name = "trail-layer"

export default TarilLayer;
