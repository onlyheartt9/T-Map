import { getPropertyByMapping } from "./Mapping";
export function sameCoord(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

// 重复点位验证方法生成器
export const PointValidatorGenerator = (_this) => {
  const ids = {};
  return (val) => {
    const newVal = getPropertyByMapping.call(_this, val);
    const id = newVal("id");
    if (ids[id]) {
      warn("批量添加点位时,出现重复ID,请核对数据 ", "ID:" + id + " ", val);
    } else {
      ids[id] = true;
    }
  };
};

export function forEach(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    const point = arr[i];
    callback(point, i);
  }
}

// 对点位批量添加的时候进行筛选过滤
export function pointForEach(points, callback, _this) {
  const valid = PointValidatorGenerator(_this);
  forEach(points, (point, i) => {
    valid(point);
    callback(point, i);
  });
}

// 封装警告方法，方便扩展
export function warn(...e) {
  console.warn(...e);
}

// 复制一个对象，将其中的key中带_的全部去除，例如width_转为witdh
export function clone(obj) {
  const newObj = Object.create(null);
  for (let key in obj) {
    let value = obj[key];
    key = key.replaceAll("_", "");
    if (value instanceof Array) {
      value = [...value];
    } else if (value instanceof Function) {
      continue;
    } else if (typeof value === "object") {
      value = clone(value);
    }

    if (value === undefined) {
      continue;
    }
    newObj[key] = value;
  }
  return newObj;
}

//生成唯一标识
export function getUuid(len, radix) {
  var chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  var uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
}
