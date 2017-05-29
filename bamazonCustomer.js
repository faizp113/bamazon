var inquirer= require('inquirer');
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
    //else {console.log("connected")}
    customer();

    function customer_continue() {
        inquirer.prompt([{
            type:'confirm',
            name: 'confirm',
            message: 'CONTINUE SHOPPING? '
        }]).then(function(confirm_response) {
            if (confirm_response.confirm) {
                customer();
            }
            else {connection.end();}
        })
    }

    function table_display(table) {
        console.log(table.length);
        console.log('ID\tNAME\tPRICE\tQUANTITY');
        for(var i = 0; i < table.length; i++) {
            console.log(table[i].item_id + "\t" + table[i].product_name +
                        "\t" + table[i].price.toFixed(2) + "\t" + table[i].stock_quantity);
        }
    }

    function customer() {
        connection.query('SELECT * FROM products', function(err, table){
        if(err){throw err;}
        table_display(table);
        //console.log(table);

        inquirer.prompt([{
            type: 'input',
            name: 'item_id',
            message: 'ITEM ID: '
        }]).then(function(input_item){
                connection.query('SELECT * FROM products WHERE ?',
                    {item_id: input_item.item_id}, 
                    function(err, item_selected){
                        //console.log(item_selected);
                        if (err) {throw err;}
                        if (item_selected == undefined) {console.log("ITEM DOES NOT EXIST.");}                       
                        inquirer.prompt([{
                            type: 'input',
                            name: 'quantity',
                            message: 'QUANTITY: '
                        }]).then(function(input_quantity){
                            var new_quantity = parseInt(item_selected[0].stock_quantity) - parseInt(input_quantity.quantity);                            
                            if (new_quantity < 0) {
                                console.log("INSUFFICIENT QUANTITY.");
                                customer_continue();
                            }
                            else {
                                var total = parseFloat(input_quantity.quantity * item_selected[0].price);
                                console.log("ORDERED " + input_quantity.quantity + " " + item_selected[0].product_name);
                                console.log("TOTAL: $" + total.toFixed(2));
                                connection.query("UPDATE products SET product_sales=product_sales+?, ? WHERE ?",
                                    [total, {stock_quantity: new_quantity}, {item_id: input_item.item_id}],
                                    function(err, res) {
                                        connection.query('UPDATE departments SET total_sales=total_sales+? WHERE ?',
                                        [total, {department_name: item_selected[0].department_name}],
                                        function(err, res){customer_continue();});                                        
                                    });
                            }
                            });
                    });
            });        
        });
    }
});


