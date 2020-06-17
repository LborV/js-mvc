var mysql = require('sync-mysql');

class model {
    constructor(config) {
        if(config.host === undefined || config.user === undefined || config.password === undefined || config.database === undefined) {
            return false;
        }

        this.database = config.database;

        try {
            this.connection = new mysql({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database
            });
        } catch(err) {
            console.log(err);
            return false;
        }

        this.tables = {};
        this.data = this.loadAll();
 

        return this;
    }

    getTables() {
        return this.execute('SHOW TABLES;').map(item => item.Tables_in_platform);
    }

    loadAll() {
        this.tables = {};

        this.getTables().forEach(table => {
            this.tables[table] = this.execute(`SELECT * FROM \`${table}\``);
        });

        return this.tables;
    }
    
    //Execute custom sql
    /**
     * 
     * @param {string} sql 
     */
    execute(sql) {
        if(typeof sql !== 'string') {
            return [];
        }

        try {
            return this.connection.query(sql);
        } catch(err) {
            console.log(err);
            return [];
        }
    }

    //Refresh
    refresh() {
     
    }
}

module.exports = model;