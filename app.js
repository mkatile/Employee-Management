const inquirer = require('inquirer');
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    user: 'mahadi',
    password: 'H@diaratoun',
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

// Function to update an employee role
function updateEmployeeRole() {
  client.query('SELECT * FROM employee', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return;
    }

    const employees = res.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));

    client.query('SELECT * FROM role', (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
        return;
      }

      const roles = res.rows.map(row => ({ name: row.title, value: row.id }));

      inquirer.prompt([
        {
          name: 'employee_id',
          type: 'list',
          message: 'Select the employee whose role you want to update:',
          choices: employees
        },
        {
          name: 'role_id',
          type: 'list',
          message: 'Select the new role for the employee:',
          choices: roles
        }
      ]).then(answers => {
        const { employee_id, role_id } = answers;
        client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id], (err, res) => {
          if (err) {
            console.error('Error executing query', err.stack);
          } else {
            console.log('Employee role updated successfully!');
            startApp();
          }
        });
      });
    });
  });
}
