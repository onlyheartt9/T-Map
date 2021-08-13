import { initMixin ,initUtils} from "./init";

function TMap(config) {
  this._init(config);
}

initMixin(TMap);
initUtils()

export default TMap;
