import VectorLayer from "ol/layer/Vector";
import Feature from "@/core/feature";
import Point from "ol/geom/Point";
import { Cluster, Vector as VectorSource } from 'ol/source';
import { getDefaultClusterStyle } from "@/core/geom/default";
import TLayer from "./BaseLayer";

class TClusterLayer extends TLayer {
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
      className: this.className,
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
    const clusterSource = new Cluster({
      distance: 30,
      minDistance: 20,
    });
    clusters.setSource(clusterSource);
    return clusters;
  }

  addPoints(points) {
    const features = [];
    points.pointForEach(point=>{
      const feature = this.getFeatureObj(point);
      features.push(feature);
    },this);
    const clusterSource = this.olLayer.getSource()
    const source = new VectorSource({
      features: features,
    });
    clusterSource.setSource(source)
  }
}

// TVectorLayer.prototype.name = "cluster-layer"

export default TClusterLayer;
