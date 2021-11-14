// const myEvent = new Event('onGraphChange', {
//     bubbles: true,
//     cancelable: true,
//     composed: false
// });

enum ConfigType { Default = "default" , Ingibitory = "ingibitory" }

export class JsonConfig {
    private static json: JSON;

    public static init(json: JSON) {
        this.validate(json);
        this.json = json;
        return this;
    }

    public static get() {
        if (!this.json) {
            throw new Error("You must first initialize the configuration");
        }
        return this.json;
    }

    protected static validate(json: JSON) {
        // TODO: Validate by JSONschema
        const rowsFP = json['matrices']['FP'].length;
        const rowsFT = json['matrices']['FT'].length;

        if (!Object.values(ConfigType).includes(json['type'] ?? ConfigType.Default)) {
            throw new Error("Invalid type net: " + json['type']);
        }

        if (json['type'] == ConfigType.Ingibitory && !json['matrices']['FI']) {
            throw new Error("Invalid format of matrices");
        }

        json['matrices']['FP'].forEach(element => {
            if (element.length != rowsFT) {
                throw new Error("Invalid format of matrices");
            }
        });
        json['matrices']['FT'].forEach(element => {
            if (element.length != rowsFP) {
                throw new Error("Invalid format of matrices");
            }
        });

        // Drop in Autofix function:
        if (!Array.isArray(json['markup'])) {
            json['markup'] = [];
        }
    }
}
