

class TLayer{
    constructor(opt){
       const {className} = opt;
       this.olLayer = null;
       this._opt = opt;
       this.className = className??this.name+"-"+TLayer._index++;
    }

    createLayer(){
        throw Error("forget init method: createLayer")
    }

    bind(map){
        this.map = map;
    }

    setVisible(key){
        this.olLayer.setVisible(key);
    }

    setZIndex(index){
        this.olLayer.setZIndex(index);
    }

}
TLayer._index = 1;
export default TLayer;