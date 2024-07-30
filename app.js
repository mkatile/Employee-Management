const inquirer = require('inquirer');
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'mahadi',
    password: 'Hadiaratoun',
    database: 'employees_db',
    port: 5432,
});

// Connect to the PostgreSQL database
client.connect(err => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
    startApp();
  }
});

// Function to start the application
function startApp() {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Delete a department',
      'Delete a role',
      'Delete an employee',
      'Update employee manager',
      'View employees by department',
      'Update an employee role',
      'Exit'
    ]

  }).then(answer => {
    switch (answer.action) {
      case 'View all departments':
        viewAllDepartments();
        break;
      case 'View all roles':
        viewAllRoles();
        break;
      case 'View all employees':
        viewAllEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Delete a department':
        deleteDepartment();
        break;
      case 'Delete a role':
        deleteRole();
        break;
      case 'Delete an employee':
        deleteEmployee();
        break;
      case 'Update employee manager':
        updateEmployeeManager();
        break;
      case 'View employees by department':
        viewEmployeesByDepartment();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        client.end();
        break;
    }
  });
}


// Function to view all departments
function viewAllDepartments() {
  client.query('SELECT * FROM department', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
    } else {
      console.table(res.rows);
      startApp();
    }
  });
}

// Function to view all roles
function viewAllRoles() {
  const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id
  `;
  client.query(query, (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
    } else {
      console.table(res.rows);
      startApp();
    }
  });
}

// Function to view all employees
function viewAllEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, manager.first_name AS manager_first_name, manager.last_name AS manager_last_name
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id
  `;
  client.query(query, (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
    } else {
      console.table(res.rows);
      startApp();
    }
  });
}

// Function to add a department
function addDepartment() {
  inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:'
  }).then(answer => {
    client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
      } else {
        console.log('Department added successfully!');
        startApp();
      }
    });
  });
}

// Function to add a role
function addRole() {
  client.query('SELECT * FROM department', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return;
    }

    const departments = res.rows.map(row => ({ name: row.name, value: row.id }));

    inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'Enter the salary for the role:'
      },
      {
        name: 'department_id',
        type: 'list',
        message: 'Select the department for the role:',
        choices: departments
      }
    ]).then(answers => {
      client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.title, answers.salary, answers.department_id], (err, res) => {
        if (err) {
          console.error('Error executing query', err.stack);
        } else {
          console.log('Role added successfully!');
          startApp();
        }
      });
    });
  });
}

// Function to add an employee
function addEmployee() {
  client.query('SELECT * FROM role', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return;
    }

    const roles = res.rows.map(row => ({ name: row.title, value: row.id }));

    client.query('SELECT * FROM employee', (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
        return;
      }

      const managers = res.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
      managers.unshift({ name: 'None', value: null });

      inquirer.prompt([
        {
          name: 'first_name',
          type: 'input',
          message: 'Enter the first name of the employee:'
        },
        {
          name: 'last_name',
          type: 'input',
          message: 'Enter the last name of the employee:'
        },
        {
          name: 'role_id',
          type: 'list',
          message: 'Select the role for the employee:',
          choices: roles
        },
        {
          name: 'manager_id',
          type: 'list',
          message: 'Select the manager for the employee:',
          choices: managers
        }
      ]).then(answers => {
        const { first_name, last_name, role_id, manager_id } = answers;
        client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id], (err, res) => {
          if (err) {
            console.error('Error executing query', err.stack);
          } else {
            console.log('Employee added successfully!');
            startApp();
          }
        });
      });
    });
  });
}

function deleteDepartment() {
  inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department to delete:'
  }).then(answer => {
    client.query('DELETE FROM department WHERE name = $1', [answer.name], (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
      } else if (res.rowCount === 0) {
        console.log('No department found with the given name.');
      } else {
        console.log('Department deleted successfully!');
      }
      startApp(); // Ensure startApp function is defined
    });
  });
}

function deleteEmployee() {
  client.query('SELECT * FROM employee', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return;
    }

    const employees = res.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));

    inquirer.prompt({
      name: 'employeeId',
      type: 'list',
      message: 'Select the employee to delete:',
      choices: employees
    }).then(answer => {
      client.query('DELETE FROM employee WHERE id = $1', [answer.employeeId], (err, res) => {
        if (err) {
          console.error('Error executing query', err.stack);
        } else if (res.rowCount === 0) {
          console.log('No employee found with the given ID.');
        } else {
          console.log('Employee deleted successfully!');
        }
        startApp();
      });
    });
  });
}
  
function deleteEmployee() {
  inquirer.prompt([
    {
      name: 'first_name',
      type: 'input',
      message: 'Enter the first name of the employee:'
    },
    {
      name: 'last_name',
      type: 'input',
      message: 'Enter the last name of the employee:'
    },
    {
      name: 'role_id',
      type: 'list',
      message: 'Select the role for the employee:',
      choices: roles
    },
    {
      name: 'manager_id',
      type: 'list',
      message: 'Select the manager for the employee:',
      choices: managers
    }
  ]).then(answers => {
  const { first_name, last_name, role_id, manager_id } = answers;
  client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id], (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
      } else if (res.rowCount === 0) {
        console.log('No employee found with the given name.');
      } else {
        console.log('Employee deleted successfully!');
      }
      startApp();
    });
  });
}


// Function to update employee manager
function updateEmployeeManager() {
  inquirer.prompt({
    name: 'employeeId',
    type: 'input',
    message: 'Enter the ID of the employee whose manager you want to update:'
  }).then(employeeAnswer => {
    const employeeId = employeeAnswer.employeeId;

    inquirer.prompt({
      name: 'newManagerId',
      type: 'input',
      message: 'Enter the ID of the new manager:'
    }).then(managerAnswer => {
      const newManagerId = managerAnswer.newManagerId;

      const query = `
        UPDATE employee
        SET manager_id = $1
        WHERE id = $2;
      `;
      client.query(query, [newManagerId, employeeId], (err, res) => {
        if (err) {
          console.error('Error executing query', err.stack);
        } else {
          console.log('Employee manager updated successfully!');
        }
        startApp(); // Ensure startApp function is defined
      });
    });
  });
}
function viewEmployeesByDepartment() {
  inquirer.prompt({
    name: 'departmentName',
    type: 'input',
    message: 'Enter the name of the department to view employees:'
  }).then(answer => {
    const departmentName = answer.departmentName;

    const query = `
      SELECT e.id, e.first_name, e.last_name, r.title AS role_title, d.name AS department_name
      FROM employee e
      INNER JOIN role r ON e.role_id = r.id
      INNER JOIN department d ON r.department_id = d.id
      WHERE d.name = $1;
    `;

    client.query(query, [departmentName], (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
      } else {
        console.table(res.rows);
      }
      startApp();
    });
  });
}

