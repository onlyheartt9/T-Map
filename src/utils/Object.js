import Mapping from "./Mapping.js";
export default class BaseObject extends Mapping {

    constructor(opt) {
        const { mapping } = opt;
        super(mapping)

        this.values_ = null;
        this.listeners_ = null;
    }

    get(key) {
        let value;
        if (this.values_ && this.values_.hasOwnProperty(key)) {
            value = this.values_[key];
        }
        return value;
    }

    getKeys() {
        return (this.values_ && Object.keys(this.values_)) || [];
    }

    getProperties() {
        return (this.values_ && assign({}, this.values_)) || {};
    }


    hasProperties() {
        return !!this.values_;
    }
    // 触发listener
    target(key, ...e) {
        const listeners = this.listeners_ || (this.listeners_ = {});
        const ls = listeners[key];
        ls.forEach(l => {
            l(...e)
        });
    }

    addListener(key, listener) {
        const listeners = this.listeners_ || (this.listeners_ = {});
        !listeners[key] && (listeners[key] = []);
        listeners[key].push(listener);
    }

    removeListener(key, listener) {
        const listeners = this.listeners_ || (this.listeners_ = {});
        const ls = listeners[key]
        if (!ls || ls.length === 0) {
            return
        }
        listeners[key] = ls.filter(l => l !== listener);
    }


    set(key, value) {
        const values = this.values_ || (this.values_ = {});
        values[key] = value;
    }

    setProperties(values) {
        for (const key in values) {
            this.set(key, values[key]);
        }
    }

    unset(key) {
        if (this.values_ && key in this.values_) {
            delete this.values_[key];
            if (isEmpty(this.values_)) {
                this.values_ = null;
            }
        }
    }
}