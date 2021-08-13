import Feature from "ol/Feature";
import Point from "ol/geom/Point";
export default class Mapping {
    mapping = {
        x: "x",
        y: "y",
        type: "type",
        id: "id"
    }

    // 点位数据结构映射，减少循环次数
    setMapping(mapping) {
        this.mapping = {...this.mapping,mapping};
        // 如果当前对象为control，则通知相关图层进行同步mapping
        this.layers && Object.values(this.layers).forEach(layer => layer.setMapping(this.mapping));
    }

    getPropertyByMapping(val) {
        return (propName) => val[this.mapping[propName]];
    }

    // 根据mapping解析val,创建feature对象
    getFeatureObj(val) {
        const newVal = this.getPropertyByMapping(val);
        const coord = [newVal("x"), newVal("y")];
        const id = newVal("id");
        const feature = new Feature(new Point(coord));
        feature._visible = true;
        if (id !== undefined) {
            feature.setId(id);
        }
        feature.set("value", val);
        return feature;
    }
}
