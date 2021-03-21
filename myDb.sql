-- \dt - Lists the tables
-- \d+ public.user - Shows the details of the user table
-- DROP TABLE public.user - Removes the user table completely so we can re-create it
-- \q - Quit the application and go back to the regular command prompt

-- // DATABASE_URL='postgres://ktbpmcuwirkaoq:39a0add99d89e8a04017792d4e6c3b380a76e72fbed1e35ba614d84cd2042743@ec2-54-159-175-113.compute-1.amazonaws.com:5432/dfr9jk71r6c4fu'
CREATE TABLE employee
(
	id INT NOT NULL PRIMARY KEY UNIQUE,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    dept_id INT NOT NULL REFERENCES public.department(id),
    emp_email VARCHAR(100) NOT NULL UNIQUE,
    user_id INT
);

CREATE TABLE department
(
    id SERIAL NOT NULL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL
);

CREATE TABLE public.user
(
    id SERIAL NOT NULL PRIMARY KEY,
	email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL,
    employee_id INT NOT NULL REFERENCES public.employee(id)
);

-- CREATE TABLE request
-- (
--     id SERIAL NOT NULL PRIMARY KEY,
--     date_created DATE NOT NULL DEFAULT CURRENT_DATE,
--     req_entry TIMESTAMP NOT NULL DEFAULT NOW (),
--     req_type VARCHAR(100) NOT NULL,
--     is_pending BOOLEAN NOT NULL DEFAULT true,
--     employee_id INT NOT NULL REFERENCES public.employee(id)
-- );

CREATE TABLE request
(
    id SERIAL NOT NULL PRIMARY KEY,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    req_date DATE NOT NULL,
    req_time_entry TIME NOT NULL,
    req_time_type CHAR(2) NOT NULL,
    req_type VARCHAR(45) NOT NULL,
    is_pending BOOLEAN NOT NULL DEFAULT true,
    employee_id INT NOT NULL REFERENCES public.employee(id)
);



-- INSERTS ----

INSERT INTO department (
    dept_name
)
VALUES (
    'Human Resources'
);

INSERT INTO employee (
	id,
	first_name,
	last_name,
	start_date,
    dept_id,
    emp_email
)
VALUES (
	000001,
	'John',
	'Doe',
	'2015-01-01',
    1,
    'johnDoe@workmail.com'
);

INSERT INTO request (
    req_date,
    req_time_entry,
    req_time_type,
    req_type,
    employee_id
)  VALUES (
    '2022-03-25',
    '09:30:00',
    'AM',
    'login',
    1
) RETURNING id;
