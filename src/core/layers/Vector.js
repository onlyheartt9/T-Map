import Feature from "@/core/feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { VectorStyles } from "@/core/geom/default";
import TLayer from "./BaseLayer";
import { sameCoord } from "@/utils"
import { getVectorContext } from 'ol/render';
import { easeOut } from 'ol/easing';
import { Circle as CircleStyle, Stroke, Style } from 'ol/style';
import { unByKey } from 'ol/Observable';

class TVectorLayer extends TLayer {
  // 闪烁状态
  _flash = false;
  // 样式
  styles = {};
  // 原生ol图层对象
  olLayer = null;

  constructor(opt) {
    super(opt);
    const { styles = [] } = opt;
    this.olLayer = this.createLayer(opt);
    this.initStyle(styles.concat(VectorStyles));
    window.tzz = this;
  }

  initStyle(styles) {
    styles.forEach((s) => {
      this.styles[s.type] = s.value;
    });
  }

  createLayer(opt) {
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
    const vectorLayer = new VectorLayer({
      ...opt,
    });
    const source = new VectorSource({
      features: [],
    });

    vectorLayer.setSource(source);
    return vectorLayer;
  }

  // 批量更新点位
  updatePoints(points){
    const source = this.olLayer.getSource();
    let map = {...source.idIndex_};
    for(let i = 0; i<points.length;i++){
      const point = points[i];
      const feature = map[point.id];
      // 存在该对象，更新
      if(feature){
        delete map[point.id];
        this._updatePoint(feature,point);
        continue;
      }

      //不存在创建
      this.addPoint(point);
    }

    const delFeatrues = Object.values(map);
    for(let i = 0; i<delFeatrues.length;i++){
      const feature = delFeatrues[i];
      source.removeFeature(feature);
    }
  }

  // 更新单个点位方法
  _updatePoint(feature,val){
    const {coord} = val;
    const lastCoord = feature.getCoordinates();
    if(!sameCoord(lastCoord,coord)){
      feature.setCoordinates(coord)
    }
    // feature.setVisible(true);
    feature.set("value",val);
  }

  // 添加点位
  addPoint(val) {
    const source = this.olLayer.getSource();
    const { coord, type = "defalut",id } = val;

    const idIndex = source.idIndex_;
    const lastFeature = idIndex[id];

    // 判断是否存在该点位，如果存在判断位置是否相同，不相同则更新位置
    if(lastFeature){
      this._updatePoint(lastFeature,val)
      return
    }

    const feature = new Feature(new Point(coord));
    feature.setStyle(this.styles[type]);
    feature._visible = true;
    if(id!==undefined){
      feature.setId(id);
    }
    feature.set("value",val);
    source.addFeature(feature);
  }

  // 批量添加点位
  addPoints(points){
    for(let i = 0;i<points.length;i++){
      const point = points[i];
      this.addPoint(point);
    }
  }

  // 获取所有点位feature
  getPoints(){
    const source = this.olLayer.getSource();
    return source.getFeatures();
  }

  // 根据id获取某个点feature
  getPointById(id){
    const source = this.olLayer.getSource();
    const feature = source.getFeatureById(id);
    return feature;
  }

  // 设置闪烁动画
  setFlash() {
    if(this._flash){
      return
    }
    this._flash = true;
    const self = this;
    const duration = 3000;
    const vectorLayer = this.olLayer;
    const source = vectorLayer.getSource();
    this.listenerKey = vectorLayer.on('postrender', animate);

    let start = Date.now();
    let timeout = null;
    function animate(event) {
      const frameState = event.frameState;
      const elapsed = frameState.time - start;
      const vectorContext = getVectorContext(event);
      const elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      let radius = easeOut(elapsedRatio) * 25 + 5;
      let opacity = easeOut(1 - elapsedRatio);
      if (opacity < 0 && !timeout) {
        radius = 5;
        opacity = 1;
        timeout = setTimeout(() => {
          start = Date.now();
          timeout = null;
          setStyle(radius, opacity);
        }, 1000);

      } else {
        setStyle(radius, opacity)
      }
      function setStyle(r, o) {
        const style = new Style({
          image: new CircleStyle({
            radius: r,
            stroke: new Stroke({
              color: 'rgba(255, 0, 0, ' + o + ')',
              width: 0.25 + o,
            }),
          }),
        });

        vectorContext.setStyle(style);
        const features = source.getFeatures();
        features.forEach(f => {
          if(!f._visible){
            return 
          }
          vectorContext.drawGeometry(f.getGeometry());
        })
        self.map.render();
      }

    }
    self.map.render();
  }

  // 关闭闪烁
  closeFlash() {
    this._flash = false;
    unByKey(this.listenerKey);
  }
}





export default TVectorLayer;
