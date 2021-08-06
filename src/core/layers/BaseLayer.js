

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

}
TLayer._index = 1;
export default TLayer;