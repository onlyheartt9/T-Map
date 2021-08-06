import VectorLayer from "ol/layer/Vector";
import {Cluster, Vector as VectorSource} from 'ol/source';
import { getDefaultClusterStyle } from "@/core/geom/default";
import TLayer from "./BaseLayer";

class TVectorLayer extends TLayer {
  constructor(opt) {
    super(opt);
    const { styles = [] } = opt;
    this.olLayer = this.createLayer(opt);
    this.styles = {};
    // this.initStyle(styles.concat(VectorStyles));
  }

  initStyle(styles) {
    styles.forEach((s) => {
      this.styles[s.type] = s.value;
    });
  }

  createLayer(opt) {
    const styleCache = {};
    const clusters = new VectorLayer({
      ...opt,
      className:this.className,
      style: function (feature) {
        const size = feature.get('features').length;
        let style = styleCache[size];
        if (!style) {
          style = getDefaultClusterStyle(size);
          styleCache[size] = style;
        }
        return style;
      },
    });
    return clusters;
  }

  addPoints(features) {
    console.log(features)
    const source = new VectorSource({
      features: features,
    });
    const clusterSource = new Cluster({
      distance: 30,
      minDistance: 20,
      source
    });
    this.olLayer.setSource(clusterSource);
  }
}

TVectorLayer.prototype.name = "cluster-layer"

export default TVectorLayer;
