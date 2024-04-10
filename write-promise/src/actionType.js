"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusEnum = void 0;
var statusEnum;
(function (statusEnum) {
    statusEnum[statusEnum["pending"] = 0] = "pending";
    statusEnum[statusEnum["fulfilled"] = 1] = "fulfilled";
    statusEnum[statusEnum["rejected"] = 2] = "rejected";
})(statusEnum || (statusEnum = {}));
exports.statusEnum = statusEnum;
