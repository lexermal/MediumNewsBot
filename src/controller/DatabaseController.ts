import { DataSource } from "typeorm";

class DBController {

    db: DataSource;

    async initDB() {
        this.db = await new DataSource({
            type: "sqlite",
            database: __dirname + '/../../db/database.sqlite',
            entities: [__dirname + '/../entity/**/*.ts'],
            synchronize: true,
        }).initialize();
    }

    getConnection() {
        return this.db;
    }
}

const DatabaseController = new DBController();

export default DatabaseController;