-- Use the database
\c employees_db;

-- Insert sample data into the departments table
INSERT INTO departments (name) 
VALUES ('Engineering'), 
       ('Human Resources'), 
       ('Finance'),
       ('Legal'),
       ('Sales');

-- Insert sample data into the roles table
INSERT INTO roles (title, salary, department_id)
VALUES  ('Engineering Manager', 120000, 1),
        ('Engineering Lead', 100000, 1),
        ('Staff Engineer', 80000, 1),
        ('HR Manager', 60000, 2),
        ('Accountant', 70000, 3),
        ('Operator', 30000, 3),
        ('Sales Manager', 75000, 5),
        ('Salesperson', 65000, 5),
        ('Legal Manager', 110000, 4),
        ('Lawyer', 95000, 4);

-- Insert sample data into the employees table
INSERT INTO employees (first_name, last_name, role_id, manager_id) 
VALUES  ('Joel', 'Iles', 1, NULL),
        ('Tom', 'Jerry', 2, 1),
        ('Florence', 'Kouame', 3, NULL),
        ('Jihanna', 'Jones', 4, 3),
        ('Olivia', 'Pope', 5, 3),
        ('Maria', 'Dia', 6, NULL),
        ('Jules', 'Cesar', 7, 6),
        ('John', 'Doe', 9, NULL);
