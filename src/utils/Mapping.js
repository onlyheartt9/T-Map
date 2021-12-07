import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { warn } from "./index";
// 数据根据映射获取对应的值
export function getPropertyByMapping(val) {
    return (propName) => {
        const v = val[this.mapping[propName]];
        if (v === undefined) {
            warn("没有 " + propName + " 对应的映射，请重新核对")
        }
        return v
    };
}

export default class Mapping {
    mapping = {
        lon: "lon",
        lat: "lat",
        type: "type",
        id: "id"
    }
    constructor(mapping){
        this.setMapping(mapping);
    }

    // 点位数据结构映射，减少循环次数
    setMapping(mapping) {
        if(!mapping){
            return
        }
        this.mapping = { ...this.mapping, ...mapping };
        // 如果当前对象为control，则通知相关图层进行同步mapping
        this.layers && Object.values(this.layers).forEach(layer => layer.setMapping(this.mapping));
    }

    // 数据根据映射获取对应的值
    getPropertyByMapping = getPropertyByMapping

    // 根据mapping解析val,创建feature对象
    // key值判断是否需要解析
    getPointObj(val,key=false) {
        // val为[lon,lat]
        if(key){
            return new Feature(new Point(val));
        }
        // val为{lon:120,lat:30}
        const newVal = this.getPropertyByMapping(val);
        const coord = [newVal("lon"), newVal("lat")];
        const id = newVal("id");
        const type = newVal("type");
        const feature = new Feature(new Point(coord));
        feature._visible = true;
        if (id !== undefined) {
            feature.setId(id);
        }
        feature.set("value", val);
        feature.set("_type", type);
        return feature;
    }
}
