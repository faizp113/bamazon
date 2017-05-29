var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) {throw err;}
    manager();

    function manager_continue() {
        inquirer.prompt([{
            type:'confirm',
            name: 'confirm',
            message: 'CONTINUE? '
        }]).then(function(confirm_response) {
            if (confirm_response.confirm) {
                manager();
            }
            else {connection.end();}
        })
    }

    function table_display(table) {
        //console.log(table.length);
        console.log('ID\tNAME\t\tPRICE\tQUANTITY');
        for(var i = 0; i < table.length; i++) {
            console.log(table[i].item_id + "\t" + table[i].product_name +
                        "\t" + table[i].price.toFixed(2) + "\t" + table[i].stock_quantity);
        }
    }

    function manager() {
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'SELECT ACTION: ',
                choices: ['VIEW PRODUCTS FOR SALE', 'VIEW LOW INVENTORY',
                        'ADD TO INVENTORY', 'ADD NEW PRODUCT']
            }]).then(function(manager_action) {
                if (manager_action.action === 'VIEW PRODUCTS FOR SALE') {
                    connection.query('SELECT * FROM products', function(err, all_products) {
                        if (err) {throw err;}
                        table_display(all_products);
                        manager_continue();
                    });
                } 
                if (manager_action.action === 'VIEW LOW INVENTORY') {
                    connection.query('SELECT * FROM products WHERE stock_quantity<5', function(err, all_products) {
                        if (err) {throw err;}
                        table_display(all_products);
                        manager_continue();
                    });
                }

                if (manager_action.action === 'ADD TO INVENTORY') {
                    connection.query('SELECT * FROM products', function(err, all_products) {
                        if (err) {throw err;}
                        table_display(all_products);            
                        inquirer.prompt([
                            {
                                name: 'item_id',
                                message: 'ITEM ID: '
                            },
                            {
                                name: 'quantity',
                                message: 'QUANTITY: '
                            }
                            ]).then(function(manager_add) {
                            if (manager_add.quantity <= 0) {
                                console.log('QUANTITY NOT ADEQUATE.');
                                manager_continue();
                            }
                            connection.query("SELECT * FROM products WHERE ?", {item_id: manager_add.item_id}, 
                                function(err, item_selected){  
                                    if (err) {throw err;}
                                    //console.log(item_selected);             
                                    var new_quantity = parseInt(item_selected[0].stock_quantity) + parseInt(manager_add.quantity);
                                    connection.query('UPDATE products SET ? WHERE ?',
                                        [{stock_quantity: new_quantity}, {item_id: manager_add.item_id}], 
                                        function(err, result) {
                                            if (err) {throw err;}
                                            manager_continue();
                                        });
                                    });
                            });
                        });
                }
                if (manager_action.action === 'ADD NEW PRODUCT') {
                    inquirer.prompt([
                            {
                                name: 'item_id',
                                message: 'ITEM ID: '
                            },
                            {
                                name: 'product_name',
                                message: 'NAME: '
                            },
                            {
                                name: 'department_name',
                                message: 'DEPARTMENT: '
                            },
                            {
                                name: 'price',
                                message: 'PRICE: '
                            }, 
                            {
                                name: 'stock_quantity',
                                message: 'QUANTITY: '
                            }
                            ]).then(function(manager_add) {
                                connection.query('INSERT INTO products SET ?', {
                                    item_id: manager_add.item_id,
                                    product_name: manager_add.product_name,
                                    department_name: manager_add.department_name,
                                    price: manager_add.price,
                                    stock_quantity: manager_add.stock_quantity
                                }, function(err, res) {
                                    if (err) {throw err;}
                                    manager_continue();
                                    });
                                
                                });
                }            
        });
    }
});