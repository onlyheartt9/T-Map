import Feature from "ol/Feature";
import { clone } from "@/utils/index.js";
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from "ol/style";
export function getStyleConfig(style) {
    const { fill_, stroke_, image_, text_ } = style;
    const fill = clone(fill_);
    const stroke = clone(stroke_);
    const text = clone(text_)
    const image = image_ ? getImageConfig(image_) : null;
    return {
        fill,
        stroke,
        image,
        text
    };
}

function getImageConfig(image) {
    let imageConf = {};
    if (image instanceof CircleStyle) {
        const fill = clone(image.fill_);
        const stroke = clone(image.stroke_);
        imageConf = { type: "circle", fill, stroke, radius: image.radius_ };
    } else {
        imageConf = { type: "icon", src: image.getSrc() };
    }
    return imageConf;
}

// 根据json获取style对象
export function getStyleObject(config) {
    const style = new Style();
    const { fill, stroke, image, text } = config;

    if (fill) {
        style.setFill(new Fill(fill));
    }
    if (stroke) {
        delete stroke.lineDash;
        style.setStroke(new Stroke(stroke));
    }

    if (text) {
        style.setFill(new Fill(text));
    }

    if (image) {
        let img = null;
        if (image.type === "icon") {
            img = new Icon({
                anchor: image.anchor ?? [0.5, 1],
                src: image.src,
            })
        } else if (image.type === "circle") {
            const { radius, fill, stroke } = image;
            delete stroke.lineDash;
            img = new CircleStyle({
                radius: radius,
                fill: new Fill(fill),
                stroke: new Stroke(stroke),
            })
        }

        style.setImage(img);
    }
    return style;
}