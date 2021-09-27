import TObject from "@/utils/Object.js"
export default class BaseControl extends TObject {
    // 图层
    layers = {};
    // 样式
    styles = {};
    // 地图对象
    map = null;
    // 图层类型名称
    className = ""

    // 创建图层的对象
    Layer = null;

    constructor(opt = {}) {
        super(opt);
        this.opt = opt;
    }
    // TODO 样式设计
    setStyles(styles) {

    }

    bind(map) {
        this.map = map;
    }

    destroy(){
        Object.values(this.layers).forEach(layer=>{
            layer.destroy();
        });
        this.layers = {};
    }

    addPoints(points) {
        const types = this._dealPoints(points)

        // 分好的类进行创建图层
        Object.keys(types).forEach(type => {
            const layer = this.getLayerByType(type);
            const pts = types[type]
            layer.addPoints(pts);
        })
    }

    updatePoints(points) {
        const types = this._dealPoints(points);
        // 将以存在的图层类型，和最新点位的图层类型去重
        const typeNames = [...new Set(Object.keys(this.layers).concat(Object.keys(types)))]
        // 分好的类进行创建图层
        typeNames.forEach(type => {
            const layer = this.getLayerByType(type);
            const pts = types[type] ?? [];
            layer.updatePoints(pts);
        });
    }

    // 获取已有的图层，如果没有该图层则直接创建
    getLayerByType(type) {
        if (this.layers[type]) {
            return this.layers[type]
        }
        const layer = new this.Layer({ className: this.className + "-" + type }, this.mapping);
        layer.bind(this.map);
        this.map.addLayer(layer.olLayer);
        this.layers[type] = layer;
        return layer
    }

    setVisibleByType(type, key) {
        const layer = this.getLayerByType(type)
        layer.setVisible(key)
    }

    setZIndexByType(type, index) {
        const layer = this.getLayerByType(type)
        layer.setZIndex(index);
    }

    _dealPoints(points) {
        const types = {};
        // 点位数据按照类型分类
        points.forEach(point => {
            const type = point[this.mapping.type];
            !types[type] && (types[type] = []);
            types[type].push(point);
        });
        return types
    }
}