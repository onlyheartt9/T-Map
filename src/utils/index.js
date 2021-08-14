
import { getPropertyByMapping } from "./Mapping";
export function sameCoord(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

// 重复点位验证方法生成器
export const PointValidatorGenerator = (obj) => {
    const ids = {};
    return (val) => {
        const newVal = getPropertyByMapping.call(obj, val);
        const id = newVal("id");
        if (ids[id]) {
           warn("批量添加点位时,出现重复ID,请核对数据 ", "ID:"+id+" ", val);
        }else{
            ids[id] = true;
        }
    }
}

// Array方法扩展，对点位批量添加的时候进行筛选过滤
export function pointForEach(callback,obj) {
    const points = this;
    console.log(points.length)
    const valid = PointValidatorGenerator(obj);
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        // 对points进行验证，防止重复ID出现
        valid(point);
        callback(point, i);
    }
}

// 封装警告方法，方便扩展
export function warn(...e){
    console.warn(...e);
 }