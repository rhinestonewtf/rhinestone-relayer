// NOTE: Super hacky way to specify BigInts be serialized as strings in JSON.stringify
// Simply import this file and change will apply

// See discussion here: https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-1006088574

interface BigInt {
    /** Convert to BigInt to string form in JSON.stringify */
    toJSON: () => string
}
BigInt.prototype.toJSON = function () {
    return this.toString()
}
