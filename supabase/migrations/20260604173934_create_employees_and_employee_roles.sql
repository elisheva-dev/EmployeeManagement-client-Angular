/*
  # Create employees and employee_roles tables

  1. New Tables
    - `employees`
      - `id` (text, primary key) - Israeli ID number (9 digits)
      - `first_name` (text, not null) - First name in Hebrew
      - `last_name` (text, not null) - Last name in Hebrew
      - `beginning_work` (date, not null) - Start date of employment
      - `date_of_birth` (date, not null) - Date of birth
      - `gender` (smallint, not null) - 0 for male, 1 for female
      - `created_at` (timestamptz) - Record creation timestamp

    - `employee_roles`
      - `id` (serial, primary key)
      - `employee_id` (text, not null) - FK to employees.id
      - `role_id` (integer, not null) - FK to roles.id
      - `is_managerial` (boolean, default false) - Whether this is a managerial position
      - `entry_date` (date) - Date the employee started this role

  2. Security
    - Enable RLS on both tables
    - Allow public read and authenticated write for employees
    - Allow public read and authenticated write for employee_roles

  3. Important Notes
    - employee_roles has ON DELETE CASCADE for both foreign keys
    - Unique constraint on (employee_id, role_id) to prevent duplicate role assignments
*/

CREATE TABLE IF NOT EXISTS employees (
  id text PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  beginning_work date NOT NULL,
  date_of_birth date NOT NULL,
  gender smallint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read employees"
  ON employees FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS employee_roles (
  id serial PRIMARY KEY,
  employee_id text NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_managerial boolean DEFAULT false,
  entry_date date,
  UNIQUE(employee_id, role_id)
);

ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read employee_roles"
  ON employee_roles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employee_roles"
  ON employee_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employee_roles"
  ON employee_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employee_roles"
  ON employee_roles FOR DELETE
  TO authenticated
  USING (true);
