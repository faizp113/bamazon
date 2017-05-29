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
    supervisor();

    function table_display(table) {
        console.log(table.length);
        console.log('department_id\tdepartment_name\t\tover_head_costs\tproduct_sales\ttotal_profit');
        for(var i = 0; i < table.length; i++) {
            console.log(table[i].department_id + "\t\t" + table[i].department_name +
                        "\t\t" + table[i].over_head_costs.toFixed(2) + "\t\t" + table[i].total_sales.toFixed(2) +
                        "\t\t" + (table[i].total_sales - table[i].over_head_costs).toFixed(2));
        }
    }

    function supervisor_continue() {
        inquirer.prompt([{
            type:'confirm',
            name: 'confirm',
            message: 'CONTINUE? '
        }]).then(function(confirm_response) {
            if (confirm_response.confirm) {
                supervisor();
            }
            else {connection.end();}
        })
    }

    function supervisor() {
        inquirer.prompt([{
            type:'list',
            name: 'operation',
            message: 'OPERATION: ',
            choices: ['VIEW PRODUCT SALES BY DEPARTMENT', 'CREATE NEW DEPARTMENT']
        }]).then(function(operation_supervisor) {
                if (operation_supervisor.operation === 'VIEW PRODUCT SALES BY DEPARTMENT') {
                    connection.query('SELECT * FROM departments', function(err, table) {
                        if (err) {throw err;}
                        table_display(table);
                        supervisor_continue();
                    });
                }
                if (operation_supervisor.operation === 'CREATE NEW DEPARTMENT'){
                    inquirer.prompt([
                        {
                            name: 'department_id',
                            message: 'DEPARTMENT ID: '
                        },
                        {
                            name: 'department_name',
                            message: 'DEPARTMENT NAME: '
                        },
                        {
                            name: 'over_head_costs',
                            message: 'OVERHEAD COSTS: '
                        }]).then(function(department_data) {
                                connection.query('INSERT INTO departments SET ?',
                                    {department_id: department_data.department_id, department_name: department_data.department_name,
                                    over_head_costs: department_data.over_head_costs, total_sales: 0}, function(err, res) {
                                        if (err) {throw err;}
                                        supervisor_continue();
                                    });    
                            });
                }
            });
    }
});