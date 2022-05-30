// variables/packages needed
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql2');

let app_question = {
    'init': {
        type: 'list',
        name: 'start',
        message: 'Please select an option below?',
        choices: ["View roles", "View departments", "View employees", "Add department", "Add role", "Add employee", "Edit employee", "Exit"]
    },
    'add_department': {
        type: 'input',
        name: 'new_dept',
        message: 'Please enter the new department name',
    },
    'edit_department': {
        'question_1': {
            type: 'list',
            name: 'update_dept',
            message: `Which department do you wish to edit?`,
            choices: [],
        },
        'question_2': {
            type: 'list',
            name: 'new_name',
            message: `Please enter new name:`,
        },
    },
    'delete_department': {
        type: 'list',
        name: 'delete_dept',
        message: `Which department do you wish to delete?`,
        choices: [],
    },
    'add_role': {
        'question_1': {
            type: 'input',
            name: 'title',
            message: 'Please enter a role title:',
        },
        'question_2': {
            type: 'input',
            name: 'salary',
            message: 'Please enter role salary:',
        },
        'question_3': {
            type: 'list',
            name: 'department_id',
            message: 'Please select a department:',
            choices: [],
        }
    },
    'delete_role': {
        type: 'list',
        name: 'delete_role',
        message: `Which role do you wish to delete?`,
        choices: [],
    },
    'add_employee': {
       'question_1': {
            type: 'input',
            name: 'first_name',
            message: `Please enter employee's first name?`,
        },
       'question_2': {
            type: 'input',
            name: 'last_name',
            message: `Please enter employee's last name?`,
        },
       'question_3': {
            type: 'list',
            name: 'role',
            message: `Please select employee's role.`,
            choices: [],
        },
       'question_4': {
            type: 'list',
            name: 'manager',
            message: `Please select employee's manager, if any?`,
            choices: [],
        },
    },
    'edit_employee': {
        'question_1': {
             type: 'list',
             name: 'employee',
             message: `Please select employee to update?`,
             choices: [],
         },
        'question_2': {
             type: 'list',
             name: 'role',
             message: `Please select employee's new role.`,
             choices: [],
         },
     },


}

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'company_table'
});

//View functions
function view_roles(dataonly, callback) {
  
    connection.query(
        'SELECT * FROM `role`',
        function(err, results) {
           
            if(dataonly) {
                result_data = results;
                return callback(results);
            }
            else {
                console.table(results);
                process.exit(1);
            }

            
        });

}

function view_employee(dataonly, callback) {

    connection.query(
        'SELECT * FROM `employee`',
        function(err, results) {

            if(dataonly) {
                result_data = results;
                return callback(results);
            }
            else {
                console.table(results);
                process.exit(1);
            }

          
        }
      );

}

function view_full_employee() {

    connection.query(
        'SELECT employee.first_name, employee.last_name, role.title as Role, department.name as Department FROM `employee` LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id',
        function(err, results) {

            console.table(results);
            process.exit(1);
          
        }
      );
}

function view_department(dataonly, callback) {
    connection.query(
        'SELECT * FROM `department`',
        function(err, results) {

            if(dataonly) {
                result_data = results;
                return callback(results);
            }
            else {
                console.table(results);
                process.exit(1);
            }            
            
        }
      );

}

//DEPARTMENT FUNCTIONS
function add_department() {

    let question = {
        type: 'input',
        name: 'new_dept',
        message: 'Please enter the new department name',
    }

    //First let's ask the user what he/she wishes to name the department
    inquirer.prompt([app_question.add_department])
    .then(res => {

        //Let's make sure that a name was provided
        if(res.new_dept === '' || isNaN(res.new_dept) !== true) {
            console.log('Please provide a name.');
            add_department();
        }
        
        //Let's insert the name into the database
        connection.query(
            `INSERT INTO department (name) VALUES ('${res.new_dept}')`,
            function(err, results) {

                if(err !== null) {
                    console.log('Something went wrong, restart application and try again.');
                    return false;
                }
                
                console.log(`Department ${res.new_dept} has been successfully added.`);
                view_department();
            }
          );


    });

}

function edit_department() {

    let dept_list = view_department();
    let dept_options = [];

    dept_list.forEach(department => {
        dept_options.push(department.name);
    });
    dept_list.push('None');

    app_question.edit_department.choices = dept_options;

    inquirer.prompt([app_question.edit_department.question_1])
    .then(res => {

        if(res.update_dept === 'None') {
            init();
        }
        else {

            inquirer.prompt([app_question.edit_department.question_2])
            .then(resp => {
           
                //Let's insert the name into the database
                connection.query(
                    `UPDATE department SET name = '${resp.new_name}' WHERE name = '${res.update_dept}'`,
                    function(err, results) {

                        if(err !== null) {
                            console.log('Something went wrong, restart application and try again.');
                            return false;
                        }
                        
                        console.log(`Department ${resp.new_name} has been successfully updated to ${res.update_dept}.`);
                        init();
                    }
                );
            });
            
        }
    });
}

function delete_department() {

    let dept_list = view_department();
    let dept_options = [];

    dept_list.forEach(department => {
        dept_options.push(department.name);
    });

    dept_list.push('None');

    app_question.delete_department.choices = dept_options;

    inquirer.prompt([app_question.delete_department])
    .then(res => {

        if(res.update_dept === 'None') {
            init();
        }
        else {

            //Let's insert the name into the database
            connection.query(
                `DELETE FROM department WHERE name = '${res.delete_dept}'`,
                function(err, results) {

                    if(err !== null) {
                        console.log('Something went wrong, restart application and try again.');
                        return false;
                    }
                    
                    console.log(`Department ${res.delete_dept} has been successfully deleted.`);
                    init();
                }
            );
            
        }
    });
}

//ROLE FUNCTIONS
function add_role() {

    let dept_data = '';
    dept_name_list = [];

    //we need to get department data
    view_department(true, function(results) {

        dept_data = results;

        dept_data.forEach(dept => {
            dept_name_list.push(dept.name);
        });

        app_question.add_role.question_3.choices = dept_name_list;

        let question = [];
        question.push(app_question.add_role.question_1);
        question.push(app_question.add_role.question_2);
        question.push(app_question.add_role.question_3);
                
         //First let's ask the user what he/she wishes to name the employee
        inquirer.prompt(question)
        .then(res => {

            //Let's make sure that a name was provided
            if(res.title === '' || isNaN(res.salary) === true) {
                console.log('Invalid data! Please try again.');
                add_role();
            }

            
            dept_data.forEach(dept => {
                if(dept.name === res.department_id) {
                    department_id = dept.id;
                }
            });
            
            //Let's insert the name into the database
            connection.query(
                `INSERT INTO role (title, salary, department_id) VALUES ('${res.title}','${res.salary}','${department_id}')`,
                function(err, results) {

                    if(err !== null) {
                        console.log('Something went wrong, restart application and try again.');
                        process.exit(1);
                    }
                    
                    console.log(`Role ${res.title} has been successfully added.`);
                    view_roles();
                }
            );


        });

        
    });
}

function delete_role() {

    let role_data = [];
    let role_names_list = [];
    let role_id = '';

    view_roles(true, function(results) {
        role_data = results;

        role_data.forEach(dept => {
            role_names_list.push(role.title);
        });

        app_question.delete_role.choices = role_names_list;

        //First let's ask the user what he/she wishes to name the employee
        inquirer.prompt([app_question.delete_role])
        .then(res => {
            
            role_data.forEach(role => {
                if(role.title === res.title) {
                    role_id = res.id;
                }
            });
            
            //Let's insert the name into the database
            connection.query(
                `DELETE FROM role WHERE id = ${role_id}`,
                function(err, results) {

                    if(err !== null) {
                        console.log('Something went wrong, restart application and try again.');
                        process.exit(1);
                    }
                    
                    console.log(`Role ${res.title} has been deleted.`);
                    view_roles();
                }
            );


        });

    });
    
}

//EMPLOYEE FUNCTIONS
function add_employee() {

    let role_data = '';
    let employee_data = '';
    let employee_name_list = [];
    let role_name_list = []; 

    view_roles(true, function(role_results) {

        role_data = role_results;
        role_data.forEach(role => {
            role_name_list.push(role.title);
        });

        app_question.add_employee.question_3.choices = role_name_list;

        view_employee(true, function(emp_results) {

            employee_data = emp_results;

            employee_name_list.push('None');
            employee_data.forEach(emp => {
                employee_name_list.push(`${emp.first_name} ${emp.last_name}`);
            });
           
            app_question.add_employee.question_4.choices = employee_name_list;

            let question = [];
            question.push(app_question.add_employee.question_1);
            question.push(app_question.add_employee.question_2);
            question.push(app_question.add_employee.question_3);
            question.push(app_question.add_employee.question_4);

            //First let's ask the user what he/she wishes to name the department
            inquirer.prompt(question)
            .then(res => {

                let data = {};
                role_data.forEach(role => {
                    if(role.title === res.role) {
                        data.role = role.id;
                    }
                });

                if(res.manager === 'None') {
                    data.manager = null;
                }
                else {
                    employee_data.forEach(emp => {
                        if(emp.first_name === res.first_name && emp.first_name === res.last_name) {
                            data.manager = emp.id;
                        }
                    });
                }

                //Let's insert the name into the database
                connection.query(
                    `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${res.first_name}', '${res.last_name}', '${data.role}', '${data.manager}')`,
                    function(err, results) {

                        if(err !== null) {
                            console.log('Something went wrong, restart application and try again.');
                            return false;
                        }
                        
                        console.log(`Employee by the name of ${res.first_name} ${res.last_name} has been successfully added.`);
                        view_employee();
                    }
                );

            });

        });

        

});

    

}

function edit_employee() {

    let role_data = '';
    let employee_data = '';
    let employee_name_list = [];
    let role_name_list = []; 



    view_roles(true, function(role_results) {

        role_data = role_results;
        role_data.forEach(role => {
            role_name_list.push(role.title);
        });

        app_question.edit_employee.question_2.choices = role_name_list;

        view_employee(true, function(emp_results) {

            employee_data = emp_results;

            employee_name_list.push('None');
            employee_data.forEach(emp => {
                employee_name_list.push(`${emp.first_name} ${emp.last_name}`);
            });
           
            app_question.edit_employee.question_1.choices = employee_name_list;

            let question = [];
            question.push(app_question.edit_employee.question_1);
            question.push(app_question.edit_employee.question_2);

            //First let's ask the user what he/she wishes to name the department
            inquirer.prompt(question)
            .then(res => {

                let data = {};
                role_data.forEach(role => {
                    if(role.title === res.role) {
                        data.role = role.id;
                    }
                });

                employee_data.forEach(emp => {

                    let name = `${emp.first_name} ${emp.last_name}`
                    if(name === res.employee) {
                        console.log('test');
                        data.employee_id = emp.id;
                    }
                });

                //Let's insert the name into the database
                connection.query(
                    `UPDATE employee (role_id) VALUES ('${data.role}') where id = ${data.employee_id}`,
                    function(err, results) {

                        if(err !== null) {
                            console.log('Something went wrong, restart application and try again.');
                            process.exit(1);
                        }
                        
                        console.log(`Employee by the name of ${res.employee} has been successfully added.`);
                        view_employee();
                    }
                );

            });

        });

        

});

    

}

function init() {

    inquirer.prompt(app_question.init)
        .then((res => {

            switch (res.start) {
                case "View roles":
                    view_roles();
                  break;
                case "View departments":
                    view_department();
                  break;
                case "View employees":
                    view_full_employee();
                  break;
                case "Add department":
                    add_department();
                  break;
                case "Edit department":
                    edit_department();
                  break;
                case "Delete department":
                    delete_department();
                  break;
                case "Add role":
                    add_role();
                  break;
                case "Add employee":
                    add_employee();
                  break;
                case "Edit employee":
                    edit_employee();
                  break;
                case "Delete role":
                    delete_role();
                  break;
                case "Exit":
                    process.exit(1);
                  
              }            
            
        }));
}

// calls function to initialize app
init();

