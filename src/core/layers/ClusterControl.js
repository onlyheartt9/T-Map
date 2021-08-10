import Cluster from "./Cluster";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
export default class ClusterControl{
    constructor(opt={}){
        this.opt = opt;
        const {mapping} = opt;
        this.layers = {};
        this.setMapping(mapping);
        
    }
    // TODO 样式设计
    setStyles(styles){

    }

    // 点位数据结构映射，减少循环次数
    setMapping(mapping){
        this.mapping = {
            x:"x",
            y:"y",
            type:"type",
            ...mapping
        }
    }

    bind(map){
        this.map = map;
    }

    addPoints(points){
        const types = {};
        // 点位数据按照类型分类
        points.forEach(point => {
            const type = point[this.mapping.type];
            const x = point[this.mapping.x];
            const y = point[this.mapping.y];
            !types[type]&&(types[type]=[]);
            point = new Feature(new Point([x,y]));
            types[type].push(point);
        });
        // 分好的类进行创建图层
        Object.keys(types).forEach(type=>{
           const layer = new Cluster({className:"cluster-"+type});
           layer.addPoints(types[type]);
           this.map.addLayer(layer.olLayer);
           this.layers[type] = layer;
        })
    }
}