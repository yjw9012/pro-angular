// Import express
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Load config for RethinkDB and express
var config = require(__dirname+"/config.js");

var r = require('rethinkdb');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

// Middleware that will create a connection to the database
app.use(createConnection);

// Define main routes
app.route('/product/get').get(get);
app.route('/order/get').get(getOrders);
app.route('/order/new').put(create);
app.route('/product/new').put(createProduct);
app.route('/product/update').post(update);
app.route('/product/delete').post(del);

// Middleware to close a connection to the database
app.use(closeConnection);


/*
 * Retrieve all products
 */
function get(req, res, next) {
    /* r.table(config.rethinkdb.table).orderBy({index: "createdAt"}).run(req._rdbConn).then(function(cursor) {
        return cursor.toArray();
    } */
    // Delete orderBy temporarily to get it working with the data that do not have createdAt property
    r.table(config.rethinkdb.table).run(req._rdbConn).then(function(cursor) {
        return cursor.toArray();
    }).then(function(result) {
        res.send(JSON.stringify(result));
    }).error(handleError(res))
    .finally(next);
}

/*
 * Retrieve all orders
 */
function getOrders(req, res, next) {
    r.table(config.rethinkdb.orderTable).run(req._rdbConn).then(function(cursor) {
        return cursor.toArray();
    }).then(function(result) {
        res.send(JSON.stringify(result));
    }).error(handleError(res))
    .finally(next);
}

/*
 * Insert a product
 */
function create(req, res, next) {
    var order = req.body;
    order.createdAt = r.now(); // Set the field `createdAt` to the current time
    r.table(config.rethinkdb.orderTable).insert(order, {returnChanges: true}).run(req._rdbConn).then(function(result) {
        if (result.inserted !== 1) {
            handleError(res, next)(new Error("Document was not inserted."));
        }
        else {
            res.send(JSON.stringify(result.changes[0].new_val));
        }
    }).error(handleError(res))
    .finally(next);
}

/*
 * Insert a product
 */
function createProduct(req, res, next) {
    var product = req.body;
    product.createdAt = r.now(); // Set the field `createdAt` to the current time
    r.table(config.rethinkdb.table).insert(product, {returnChanges: true}).run(req._rdbConn).then(function(result) {
        if (result.inserted !== 1) {
            handleError(res, next)(new Error("Document was not inserted."));
        }
        else {
            res.send(JSON.stringify(result.changes[0].new_val));
        }
    }).error(handleError(res))
    .finally(next);
}

/*
 * Update a product
 */
function update(req, res, next) {
    var product = req.body;
    if ((product != null) && (product.id != null)) {
        r.table(config.rethinkdb.table).get(product.id).update(product, {returnChanges: true}).run(req._rdbConn).then(function(result) {
            res.send(JSON.stringify(result.changes[0].new_val));
        }).error(handleError(res))
        .finally(next);
    }
    else {
        handleError(res)(new Error("The product must have a field `id`."));
        next();
    }
}

/*
 * Delete a product
 */
function del(req, res, next) {
    var product = req.body;
    if ((product != null) && (product.id != null)) {
        r.table(config.rethinkdb.table).get(product.id).delete().run(req._rdbConn).then(function(result) {
            res.send(JSON.stringify(result));
        }).error(handleError(res))
        .finally(next);
    }
    else {
        handleError(res)(new Error("The product must have a field `id`."));
        next();
    }
}

/*
 * Send back a 500 error
 */
function handleError(res) {
    return function(error) {
        res.send(500, {error: error.message});
    }
}

/*
 * Create a RethinkDB connection, and save it in req._rdbConn
 */
function createConnection(req, res, next) {
    r.connect(config.rethinkdb).then(function(conn) {
        req._rdbConn = conn;
        next();
    }).error(handleError(res));
}

/*
 * Close the RethinkDB connection
 */
function closeConnection(req, res, next) {
    req._rdbConn.close();
}

/*
 * Create tables/indexes then start express
 */
r.connect(config.rethinkdb, function(err, conn) {
    if (err) {
        console.log("Could not open a connection to initialize the database");
        console.log(err.message);
        process.exit(1);
    }

    r.table(config.rethinkdb.table).indexWait('createdAt').run(conn).then(function(err, result) {
        console.log("Products Table and index are available, starting express...");
        connectToOrdersTable();
    }).error(function(err) {
        // The database/table/index was not available, create them
        r.dbCreate(config.rethinkdb.db).run(conn).finally(function() {
            return r.tableCreate(config.rethinkdb.table).run(conn)
        }).finally(function() {
            r.table(config.rethinkdb.table).indexCreate('createdAt').run(conn);
        }).finally(function(result) {
            r.table(config.rethinkdb.table).indexWait('createdAt').run(conn)
        }).then(function(result) {
            console.log("Products Table and index are available, starting express...");
            connectToOrdersTable();
            conn.close();
        }).error(function(err) {
            if (err) {
                console.log("Could not wait for the completion of the index `products`");
                console.log(err);
                process.exit(1);
            }
            console.log("Products Table and index are available, starting express...");
            connectToOrdersTable();
            conn.close();
        });
    });

    function connectToOrdersTable() {
        r.table(config.rethinkdb.orderTable).indexWait('createdAt').run(conn).then(function(err, result) {
            console.log("Orders Table and index are available, starting express...");
            startExpress();
        }).error(function(err) {
            // The database/table/index was not available, create them
            r.dbCreate(config.rethinkdb.db).run(conn).finally(function() {
                return r.tableCreate(config.rethinkdb.orderTable).run(conn)
            }).finally(function() {
                r.table(config.rethinkdb.orderTable).indexCreate('createdAt').run(conn);
            }).finally(function(result) {
                r.table(config.rethinkdb.orderTable).indexWait('createdAt').run(conn)
            }).then(function(result) {
                console.log("Orders Table and index are available, starting express...");
                startExpress();
                conn.close();
            }).error(function(err) {
                if (err) {
                    console.log("Could not wait for the completion of the index `products`");
                    console.log(err);
                    process.exit(1);
                }
                console.log("Orders Table and index are available, starting express...");
                startExpress();
                conn.close();
            });
        });
    }
});

function startExpress() {
    app.listen(config.express.port);
    console.log('Listening on port '+config.express.port);
}
