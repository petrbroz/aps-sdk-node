class DesignAutomationURI {
    constructor(id) {
        const d = id.indexOf('.');
        const p = id.indexOf('+');
        this.owner = id.substr(0, d);
        if (p === -1) {
            this.name = id.substr(d + 1);
            this.version = undefined;
        } else {
            this.name = id.substr(d + 1, p - d - 1);
            this.version = id.substr(p + 1);
        }
    }

    toString() {
        return this.owner + '.' + this.name + (this.version ? '+' + this.version : '');
    }
}

module.exports = {
    DesignAutomationURI
};
