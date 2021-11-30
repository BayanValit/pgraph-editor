export enum ConfigType { Default = 'default' , Inhibitory = 'inhibitory' }

export class JsonConfig {
    private static json: JSON;

    public static init(json: JSON) {
        this.json = json;
        this.autofix();
        this.validate();
        return this;
    }

    public static get() {
        if (!this.json) {
            throw new Error("You must first initialize the configuration");
        }
        return this.json;
    }

    protected static autofix() {
        this.json["type"] ??= ConfigType.Default;

        if (this.json["type"] == ConfigType.Inhibitory) {
            this.json["matrices"]["FI"] ??= Array.from(this.json["matrices"]["FP"] as Array<number[]>, x => x.fill(0));
        }

        if (!Array.isArray(this.json["markup"])) {
            this.json["markup"] = [];
        }
    }

    protected static validate(): void | never {
        const rowsFP = this.json["matrices"]["FP"].length;
        const rowsFT = this.json["matrices"]["FT"].length;

        if (!Object.values(ConfigType).includes(this.json["type"] ?? ConfigType.Default)) {
            throw new Error("Invalid type net: " + this.json["type"]);
        }

        this.json["matrices"]["FP"].forEach(element => {
            if (element.length != rowsFT) {
                throw new Error("Invalid format of matrices");
            }
        });

        this.json["matrices"]["FT"].forEach(element => {
            if (element.length != rowsFP) {
                throw new Error("Invalid format of matrices");
            }
        });

        if (this.json["type"] == ConfigType.Inhibitory) {

            this.json["matrices"]["FI"].forEach(element => {
                if (element.length != rowsFT) {
                    throw new Error("Invalid format of inhibitory matrix");
                }
            });
            if (this.json["matrices"]["FI"].length != rowsFP) {
                throw new Error("Invalid format of inhibitory matrix");
            }
        }
    }
}
