
import Mapping from "@/utils/Mapping"
class TLayer extends Mapping {
    // ol的图层
    olLayer = null;

    // 图层className
    className = "";

    constructor(opt={}) {
        const { className, mapping } = opt;
        super(mapping);
        this._opt = opt;
        this.className = className ?? this.name + "-" + TLayer._index++;
    }

    createLayer() {
        throw Error("forget init method: createLayer")
    }

    bind(map) {
        this.map = map;
    }

    setVisible(key) {
        this.olLayer.setVisible(key);
    }

    setZIndex(index) {
        this.olLayer.setZIndex(index);
    }

}
TLayer._index = 1;
export default TLayer;