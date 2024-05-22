-- Insert sample data into the department table
INSERT INTO department (name) 
VALUES ('Engineering'), 
       ('Human Resources'), 
       ('Finance'),
       ('Legal'),
       ('Sales');



--Select role
INSERT INTO role (title, salary, department_id)
VALUES  ('Engineering Manager', 120000, 1),
('Engineering Lead', 100000, 1),
('Staff Engineer', 80000, 1),
('HR Manager', 60000, 2),
('Accountant', 70000, 2),
('Operator', 30000, 2),
('Sales Manager', 75000, 4),
('Salesperson', 65000, 4),
('Legal Manager', 110000, 5),
('Lawyer', 95000, 5);

-- SELECT * FROM employee

USE employees_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES  ('Joel', 'Iles', 1, NULL ),
('Tom', 'Jerry', 2, 1),
('Florence', 'Kouame', 3, null),
('Jihanna', 'Jones', 4, 3),
('Olivia', 'Pope', 5, 3),
('Maria', 'Dia', 6, null),
('Jules', 'Cesar', 7, 6),
('John', 'Doe', 9, null);




